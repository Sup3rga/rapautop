let {Articles,Category} = require('../data/dataPackage');
const code = require('../utils/ResponseCode'),
      Channel = require('../utils/Channel');
const Filter = require("./Filter");

async function saveCategory(sector, data, socket){
    let message = [],
        save = data.save,
        category, update;
    for(let i in save){
        update = 'id' in save[i];
        category = update ? await Category.getById(save[i].id) : new Category();
        // console.log('[update]',save[i], category);
        if(category) {
            category.name = save[i].name;
            category.id = update ? save[i].id : 0;
            category.sector = sector;
            category.branch = data.bhid;
            if(update){
                category.modifiedAt = new Date();
                category.modifiedBy = data.cmid;
            }
            else{
                category.createdAt = new Date();
                category.createdBy = data.cmid;
            }
            const request = await category.save();
            if(request.error){
                message.push('[ID] ' + save[i].id + ' :: error during operation');
            }
        }
        else{
            message.push('[ID] ' + save[i].id + ' :: invalid');
        }
    }
    save = data.del;
    for(let i in save) {
        category = Category.getById(save[i]);
        if(category){
            const request = await category.delete();
            if(request.error){
                message.push('[ID] ' + save[i] + ' :: error during operation');
            }
        }
        else{
            message.push('[ID] ' + save[i].id + ' :: invalid');
        }
    }
    socket.emit('/'+(sector === 'A' ? 'writing' : 'punchline')+'/category/get', Channel.message({
        error : false,
        code : code.SUCCESS,
        message: message,
        data : await Category.fetchAll(data.bhid, sector)
    }))
}

function manage(socket){
    socket.emit("connected");
    socket.on("disconnecting", ()=>{
        console.log('disconnected');
    })
    socket.on('/writing/write', async (data)=>{
        console.log('[Article]',data);
        if(Filter.contains(data, [
            'title','content', 'img','cmid','bhid','cmtk', 'category'
        ])){
            const update = 'id' in data;
            let article = update ? await Articles.getById(data.id) : new Articles();
            article.title = data.title;
            article.content = data.content;
            article.caption = 'caption' in data ? data.caption : null;
            if(!update){
                article.createdAt = new Date();
                article.createdBy = data.cmid;
                article.postOn = new Date();
                article.category = data.category;
                article.branch = data.bhid;
            }
            else {
                if(data.bhid !== article.branch){
                    return socket.emit("/writing/write/response",Channel.message({
                        code: code.INVALID
                    }));
                }
                article.modifiedAt = new Date();
                article.modifiedBy = data.cmid;
            }
            let message = await article.save();
            socket.emit("/writing/write/response", message);
        }
        else {
            return socket.emit("/writing/write/response",Channel.message({
                code: code.INVALID
            }));
        }
    })
    .on('/writing/category/fetch', async(data)=>{
        socket.emit("/writing/category/get", Channel.message({
            error: false,
            code: code.SUCCESS,
            data: await Category.fetchAll(data.bhid, 'A')
        }));
    })
    .on('/writing', async(e)=>{
        console.log('[fetch]',e);
        let result = {
            categories: await Category.fetchAll(e.bhid, 'A'),
            articles: await Articles.fetchAll(e.bhid)
        }
        console.log('[Result]',result);
        socket.emit("/writing/data", Channel.message({
            error: false,
            code : code.SUCCESS,
            data: result
        }));
    })
    .on('/writing/category/set', async(data)=>{
        await saveCategory('A', data, socket);
    })
    .on('/punchline/category/set', async (e) => {
        await saveCategory('P', data, socket);
    })
}

module.exports = manage;