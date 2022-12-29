let {Articles,Category} = require('../data/dataPackage');
const code = require('../utils/ResponseCode'),
      Channel = require('../utils/Channel');

async function saveCategory(sector, data, socket){
    let message = [],
        save = data.save,
        category, update;
    for(let i in save){
        update = 'id' in save[i];
        category = update ? Category.getById(save[i].id) : new Category();
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
            console.log('[request]',request);
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
        data : await Articles.fetchAll(data.bhid, 'A')
    }))
}

function manage(socket){
    socket.emit("connected");
    socket.on("disconnecting", ()=>{
        console.log('disconnected');
    })
    socket.on('submit-article', async (e)=>{
        console.log('[Article]',e);
        let article = new Articles();
        article.title = e.title;
        article.content = e.content;
        article.createdAt = new Date();
        article.modifiedAt = new Date();
        article.createdBy = e.cmid;
        article.modifiedBy = e.cmid;
        article.postOn = new Date();
        article.category = null;
        let message = await article.save();
        socket.emit("article-set");
    })
    .on('/writing', async(e)=>{
        console.log('[fetch]',e);
        let result = {
            categories: await Category.fetchAll(e.bhid, 'A'),
            articles: await Articles.fetchAll(e.bhid)
        }
        console.log('[Result]',result);
        socket.emit("/writing/data", result);
    })
    .on('/writing/category/set', async(data)=>{
        await saveCategory('A', data, socket);
    })
    .on('/punchline/category/set', async (e) => {
        await saveCategory('P', data, socket);
    })
}

module.exports = manage;