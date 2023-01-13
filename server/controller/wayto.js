let {
    Articles,Category,Punchlines,
    Messenging, Manager, Subscriber
} = require('../data/dataPackage');
const code = require('../utils/ResponseCode'),
    Channel = require('../utils/Channel');
const Filter = require("../utils/Filter");
const {is_array,isset,is_file,unlink} = require('../utils/procedures');
const AkaDatetime = require('../utils/AkaDatetime');
const fs = require('fs');
const {promisify} = require('util');
const defaultQuery = ['cmid', 'bhid','cmtk'];

const Wayto = {};

Wayto.connect = async (data)=>{
    if(!Filter.contains(data, ['identifier', 'code'])){
        return Channel.message({code: code.INVALID});
    }
    return await Manager.connect(data.identifier, data.code);
}

Wayto.getAllCategories = async (data, sector='A')=>{
    return Channel.message({
        error: false,
        code: code.SUCCESS,
        data: await Category.fetchAll(data.bhid, sector)
    });
}

Wayto.getAllWritingData = async (data)=>{
    return Channel.message({
        error: false,
        code : code.SUCCESS,
        data: {
            categories: await Category.fetchAll(data.bhid, 'A'),
            articles: await Articles.fetchAll(data.bhid)
        }
    });
}

Wayto.getArticles = async (data)=>{
    if(Filter.contains(data, [
        'artid', ...defaultQuery
    ])){
        return Channel.message({
            error: true,
            code: code.INVALID
        });
    }
    const article = await Articles.getById(data.artid);
    if(article){
        return Channel.message({
            error: false,
            code: code.SUCCESS,
            data: await article.data()
        });
    }
    return Channel.message({
        error: true,
        code: code.INVALID
    });
}

Wayto.getLogo = async (data)=>{
    try {
        const data = await promisify(fs.readFile)('../public/assets/white-logo.jpg');
        // console.log('[logo...]',data);
        return Channel.message({
            error: false,
            data
        });
    }catch(e){
        return Channel.logError(e).message({
            code: code.SUCCESS
        });
    }
}

Wayto.getPunchlines = async (data)=>{
    if(!Filter.contains(data, defaultQuery, [null,0,''])){
        return Channel.message({code: code.INVALID});
    }
    return Channel.message({
        error: false,
        code : code.SUCCESS,
        data: {
            punchlines: await Punchlines.fetchAll(data.bhid),
            years: await Punchlines.fetchYears(data.bhid),
            artists: await Punchlines.fetchArtists(data.bhid)
        }
    });
}

Wayto.receiveMessage = async (data)=>{
    console.log('[Data]',data)
    if(!Filter.contains(data, [
        'cli_fname', 'cli_lname', 'cli_mail', 'cli_msg','cli_bhid'
    ])){
        return Channel.message({code: code.INVALID});
    }
    let client = await Subscriber.getByEmail(data.cli_mail),
        saving;
    if(!client){
        client = new Subscriber();
        client.mail = data.cli_mail;
        client.contact = 1;
        client.branch = data.cli_bhid;
        client.createdAt = AkaDatetime.now();
        saving = await client.save();
        if(saving.error){
            return saving;
        }
        client = await Subscriber.getByEmail(client.mail);
    }
    const message = new Messenging();
    message.lastname = data.cli_lname;
    message.firstname = data.cli_fname;
    message.client = client.id;
    message.message = data.cli_msg;
    message.postOn = AkaDatetime.now();
    saving = await message.save();
    if(saving.error){
        return saving;
    }
    return Channel.message({
        error: false,
        code: code.SUCCESS
    })
}

Wayto.getAllMessages = async (data)=>{
    if(!Filter.contains(data, defaultQuery)){
        return Channel.message({code: code.INVALID});
    }
    return Channel.message({
        error: false,
        code: code.SUCCESS,
        data: await Messenging.fetchAll(data.bhid)
    })
}

Wayto.commitCategories = async (data, sector)=>{
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
    return Channel.message({
        error : false,
        code : code.SUCCESS,
        message: message,
        data : await Category.fetchAll(data.bhid, sector)
    });
}

Wayto.commitRedaction = async (data)=>{
    if(Filter.contains(data, [ ...defaultQuery,
        'title','content', 'img', 'category',
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
                return Channel.message({
                    code: code.INVALID
                });
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
        return message;
    }
    else {
        return Channel.message({
            code: code.INVALID
        });
    }
}

Wayto.commitPunchline = async (data)=>{
    if(!Filter.contains(data, [
        ...defaultQuery,
        'title','year','artist', 'category',
        'punchline', 'res'
    ], [null,0,''])){
        return Channel.message({code: code.INVALID});
    }
    const update = 'id' in data;
    const punchline = update ? await Punchlines.getById(data.id) : new Punchlines();
    if(!punchline || !is_array(data.res) || (!update && data.res.length < 2)){
        return Channel.message({code: code.INVALID});
    }
    punchline.title = data.title;
    punchline.artist = data.artist;
    punchline.category = data.category;
    punchline.year = data.year;
    punchline.punchline = data.punchline;
    punchline.lyrics = data.lyrics ? data.lyrics : null;
    punchline.comment = data.comment ? data.comment : null;
    console.log('[Res]',data.res);
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
        new AkaDatetime().isLessThan(new AkaDatetime(data.schdate))
    ){
        punchline.postOn = data.schdate;
    }
    if(!update && !punchline.postOn){
        punchline.postOn = new AkaDatetime().getDateTime();
    }
    const saving = await punchline.save();
    if(saving.error){
        //We remove uploaded files
        for(let i in data.res){
            if(await is_file(DIR.PUBLIC+data.res[i])){
                await unlink(DIR.PUBLIC+data.res[i]);
            }
        }
        return saving;
    }
    return Channel.message({
        ...saving,
        data: {
            punchlines: await Punchlines.fetchAll(data.bhid),
            years: await Punchlines.fetchYears(data.bhid),
            artists: await Punchlines.fetchArtists(data.bhid)
        }
    });
}

module.exports = Wayto;