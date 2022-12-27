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
    .on('fetch-categories', async(e)=>{
        console.log('[fetch]',e);
        socket.emit("get-categories", await Category.fetchAll(e.branch, e.type == 'writing' ? 'A' : 'P'));
    });
}

module.exports = manage;