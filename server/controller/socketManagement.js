const Wayto = require('./wayto');
const SocketTransfer = require('./sockettransfer');
const CommonServe = require('./commonserve');

function manage(socket){
    const tns = new SocketTransfer(socket);
    tns
    .transfer(null, 'connected',null)
    .transfer('disconnecting', ()=>{
        console.log('disconnected');
    })
    .transfer('/writing/write', '/writing/write/response', Wayto.commitRedaction)
    .transfer('/writing/category/fetch', '/writing/category/get', Wayto.getAllCategories)
    .transfer('/writing', '/writing/data', Wayto.getAllWritingData)
    .transfer('/writing/category/set', '/writing/category/get', Wayto.commitCategories, ['A'])
    .transfer('/articles', "/articles/get", Wayto.getArticles)
    .transfer('/logo/fetch', "/logo/get", Wayto.getLogo)
    .transfer('/punchlines/category/set', "/punchlines/category/get", Wayto.commitCategories, ['P'])
    .transfer('/punchlines/category/fetch', "/punchlines/category/get", Wayto.getAllCategories, ['P'])
    .transfer('/punchlines/create', "/punchlines/get", Wayto.commitPunchline)
    .transfer('/punchlines/fetch', "/punchlines/get", Wayto.getPunchlines)
    .transfer('/articles', "/articles/get", Wayto.getArticles)
    .transfer('/articles', "/articles/get", Wayto.getArticles)
    .transfer('/articles', "/articles/get", Wayto.getArticles)
    .transfer('/messages/fetch', '/messages/get', Wayto.getAllMessages)
    .transfer('/message/reply', '/message/get', Wayto.replyMessage)
    .transfer('/message/delete', '/message/remove', Wayto.deleteMessage)
    .transfer('/privilegies/fetch', '/privilegies/get', Wayto.getPrivilegies)
}

function serve(request, response, uploader){
    new CommonServe(request, response)
    .serve(['identifier','code'], Wayto.connect)
    .serve(['cli_fname', 'cli_lname', 'cli_mail', 'cli_msg', 'cli_bhid'], Wayto.receiveMessage)
    .serve(['upl_artimg'], Wayto.uploadArticleImage, [uploader])
    .serve(['pch_img'], Wayto.uploadPunchlineImage, [uploader])
    .serve(['upl_mailimg'], Wayto.uploadMailImage, [uploader])
    .notFound()
}

module.exports = {manage,serve};