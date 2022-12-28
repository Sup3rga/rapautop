let {Articles,Category} = require('../data/dataPackage');

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
            categories: await Category.fetchAll(e.branch, 'A'),
            articles: await Articles.fetchAll(e.branch)
        }
        console.log('[Result]',result);
        socket.emit("/writing/data", result);
    });
}

module.exports = manage;