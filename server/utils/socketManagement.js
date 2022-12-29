let {Articles,Category} = require('../data/dataPackage');
const code = require('../utils/ResponseCode'),
      Channel = require('../utils/Channel');

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
    .on('/writing/category/set', async(e)=>{
        let message = [],
            save = e.save,
            category, update;
        for(let i in save){
            update = 'id' in save[i];
            category = update ? Category.getById(save[i].id) : new Category();
            if(category) {
                category.name = save[i].name;
                category.id = update ? save[i].id : 0;
                category.sector = 'A';
                category.branch = e.bhid;
                if(update){
                    category.modifiedAt = new Date();
                    category.modifiedBy = e.cmid;
                }
                else{
                    category.createdAt = new Date();
                    category.createdAt = e.cmid;
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
        save = e.del;
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
        socket.emit('/writing/category/get', Channel.message({
            error : false,
            code : code.SUCCESS,
            message: message,
            data : await Articles.fetchAll(e.bhid, 'A')
        }))
    });
}

module.exports = manage;