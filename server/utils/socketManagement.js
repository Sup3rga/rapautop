let {Articles,Category,Punchlines} = require('../data/dataPackage');
const code = require('../utils/ResponseCode'),
      Channel = require('../utils/Channel');
const Filter = require("./Filter");
const {is_array,isset} = require('./procedures');
const AkaDatetime = require('./AkaDatetime');
const fs = require('fs');
const {promisify} = require('util');

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
    socket.emit('/'+(sector === 'A' ? 'writing' : 'punchlines')+'/category/get', Channel.message({
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
    .on('/writing/write', async (data)=>{
        // console.log('[Article]',data);
        if(Filter.contains(data, [
            'title','content', 'img','cmid','bhid','cmtk', 'category',
            'schdate'
        ])){

            const update = 'id' in data;
            let article = update ? await Articles.getById(data.id) : new Articles();
            // console.log('[UPDATE]',article);
            article.title = data.title;
            article.content = data.content;
            article.category = data.category;
            if(is_array(data.img)){
                article.pictures = data.img;
            }
            if(!update){
                article.createdAt = new Date();
                article.createdBy = data.cmid;
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
            if(
                update &&
                isset(data.schdate) && AkaDatetime.isDateTime(data.schdate) &&
                !article.published
            ){
                console.log('[Set Date]',data.schdate);
                article.postOn = data.schdate;
            }
            else if(!update){
                article.postOn = new Date();
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
        let result = {
            categories: await Category.fetchAll(e.bhid, 'A'),
            articles: await Articles.fetchAll(e.bhid)
        }
        socket.emit("/writing/data", Channel.message({
            error: false,
            code : code.SUCCESS,
            data: result
        }));
    })
    .on('/writing/category/set', async(data)=>{
        await saveCategory('A', data, socket);
    })
    .on('/articles', async(data)=>{
        if(Filter.contains(data, [
            'artid','cmid','bhid','cmtk'
        ])){
            const article = await Articles.getById(data.artid);
            if(article){
                socket.emit("/articles/get", Channel.message({
                    error: false,
                    code: code.SUCCESS,
                    data: await article.data()
                }));
            }
            else{
                socket.emit("/articles/get", Channel.message({
                    error: true,
                    code: code.INVALID
                }));
            }
        }
        else{
            socket.emit("/articles/get", Channel.message({
                error: true,
                code: code.INVALID
            }));
        }
    })
    .on('/logo/fetch', async(data)=>{
        // console.log('[logo]',data);
        try {
            const data = await promisify(fs.readFile)('../public/assets/white-logo.jpg');
            // console.log('[logo...]',data);
            socket.emit('/logo/get', Channel.message({
                error: false,
                data
            }))
        }catch(e){
            socket.emit('/logo/get', Channel.logError(e).message({
                code: code.SUCCESS
            }))
        }
    })
    .on('/punchlines/category/set', async (data) => {
        console.log('[Data]',data);
        await saveCategory('P', data, socket);
    })
    .on('/punchlines/category/fetch', async(data)=>{
        socket.emit("/punchlines/category/get", Channel.message({
            error: false,
            code: code.SUCCESS,
            data: await Category.fetchAll(data.bhid, 'P')
        }));
    })
    .on('/punchlines/create', async(data)=>{
        console.log('[Data]',data);
        if(!Filter.contains(data, [
            'cmid', 'bhid','cmtk',
            'title','year','artist', 'category',
            'punchline', 'res'
        ], [null,0,''])){
            return socket.emit(Channel.message({code: code.INVALID}))
        }
        const update = 'id' in data;
        const punchline = update ? await Punchlines.getById(data.id) : new Punchlines();
        if(!punchline || !is_array(data.res) || (!update && data.res.length < 2)){
            return socket.emit('/punchlines/get',Channel.message({code: code.INVALID}));
        }
        punchline.title = data.title;
        punchline.artist = data.artist;
        punchline.category = data.category;
        punchline.year = data.year;
        punchline.punchline = data.punchline;
        punchline.lyrics = data.lyrics ? data.lyrics : null;
        punchline.comment = data.comment ? data.comment : null;
        if(data.res.length){
            punchline.card = data.res[0];
            if(data.res[1]){
                punchline.picture = data.res[1];
            }
        }
        punchline[update ? 'modifiedBy' : 'createdBy'] = data.cmid;
        punchline[update ? 'modifiedAt' : 'createdAt'] = new AkaDatetime().getDateTime();
        if(!update){
            punchline.branch = data.bhid;
        }
        if(data.schdate && AkaDatetime.isDateTime(data.schdate) &&
            (
                !update || (update && new AkaDatetime().isLessThan(new AkaDatetime()))
            )
        ){
            punchline.postOn = data.schdate;
        }
        else if(!update){
            punchline.postOn = new AkaDatetime().getDateTime();
        }
        const saving = await punchline.save();
        if(saving.error){
            return socket.emit('/punchlines/get',saving);
        }
        socket.emit('/punchlines/get',Channel.message({
            ...saving,
            data: await Punchlines.fetchAll(data.bhid)
        }));
    });
}

module.exports = manage;