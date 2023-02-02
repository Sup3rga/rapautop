let {
    Articles,Category,Punchlines,
    Messenging, Manager, Subscriber, Pictures,
    MailingReply, Sys, Branch
} = require('../data/dataPackage');
const code = require('../utils/ResponseCode'),
    Channel = require('../utils/Channel');
const Filter = require("../utils/Filter");
const {is_array,isset,is_file,unlink,toHexa,set} = require('../utils/procedures');
const AkaDatetime = require('../utils/AkaDatetime');
const fs = require('fs');
const {promisify} = require('util');
const defaultQuery = ['cmid', 'bhid','cmtk'];
const privileges = require('../data/Privileges');

const Wayto = {};

Wayto.startManagement = async () =>{
    if(Manager.list.length > 0){
        return true;
    }
    else {
        console.log('[Man]...',Manager.list.length);
        await Manager.fetchAll();
    }
}

Wayto.connect = async (data)=>{
    if(!Filter.contains(data, ['identifier', 'code'])){
        return Channel.message({code: code.INVALID});
    }
    return await Manager.connect(data.identifier, data.code);
}

Wayto.getAllCategories = async (data, sector='A')=>{
    if(!Filter.contains(data, defaultQuery, [null,0,''])){
        return Channel.message({code: code.INVALID});
    }
    if(!(await Manager.checkAuthentification(data.cmid, data.cmtk))) return Channel.message({code: code.LOGOUT})
    return Channel.message({
        error: false,
        code: code.SUCCESS,
        data: await Category.fetchAll(data.bhid, sector)
    });
}

Wayto.getAllWritingData = async (data)=>{
    if(!Filter.contains(data, defaultQuery, [null,0,''])){
        return Channel.message({code: code.INVALID});
    }
    if(!(await Manager.checkAuthentification(data.cmid, data.cmtk))) {
        return Channel.message({code: code.LOGOUT})
    }
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
    if(!Filter.contains(data, defaultQuery)){
        return Channel.message({
            error: true,
            code: code.INVALID
        });
    }
    if(!(await Manager.checkAuthentification(data.cmid, data.cmtk))) {
        return Channel.message({code: code.LOGOUT})
    }
    if(!isset(data.artid)){
        return Channel.message({
            error: false,
            code: code.SUCCESS,
            data: await Articles.fetchAll(data.bhid, true, false)
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
    if(!Filter.contains(data, defaultQuery, [null,0,''])){
        return Channel.message({code: code.INVALID});
    }
    if(!(await Manager.checkAuthentification(data.cmid, data.cmtk))) {
        return Channel.message({code: code.LOGOUT})
    }
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
    if(!(await Manager.checkAuthentification(data.cmid, data.cmtk))) {
        return Channel.message({code: code.LOGOUT})
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

Wayto.getPunchlinesConfig = async (data)=>{
    if(!Filter.contains(data, defaultQuery, [null,0,''])){
        return Channel.message({code: code.INVALID});
    }
    if(!(await Manager.checkAuthentification(data.cmid, data.cmtk))) {
        return Channel.message({code: code.LOGOUT})
    }
    // console.log('[Config]',data);
    return Channel.message({
        error: false,
        code: code.SUCCESS,
        data: {
            cardWidth : set(await Sys.get('cardWidth'+data.bhid), 400) * 1,
            cardHeight : set(await Sys.get('cardHeight'+data.bhid), 400) * 1,
            cardBg : set(await Sys.get('cardBg'+data.bhid), '#000'),
            cardBandBg :  set(await Sys.get('cardBandBg'+data.bhid),'#fff'),
            cardTextColor : set(await Sys.get('cardTextColor'+data.bhid), '#fff'),
            cardBandColor : set(await Sys.get('cardBandColor'+data.bhid),'#000')
        }
    });
}

Wayto.receiveMessage = async (data)=>{
    if(!Filter.contains(data, [
        'cli_fname', 'cli_lname', 'cli_mail', 'cli_msg','cli_bhid'
    ])){
        return Channel.message({code: code.INVALID});
    }
    if(!(await Manager.checkAuthentification(data.cmid, data.cmtk))) {
        return Channel.message({code: code.LOGOUT})
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

Wayto.readMessage = async (data, passBy = false) => {
    if(!passBy && !Filter.contains(data, [...defaultQuery, 'msgid'])){
        return Channel.message({code: code.INVALID});
    }
    if(!passBy && !(await Manager.checkAuthentification(data.cmid, data.cmtk))) {
        return Channel.message({code: code.LOGOUT})
    }

    const manager = await Manager.getById(data.cmid);
    if(!manager) return Channel.message({code: code.DENIED_ACCESS});
    if(!manager.hasAccess(200, data.bhid)) return Channel.message({code: code.INSUFFICIENT_PRIVILEGE});

    let result = await Messenging.getById(data.msgid);
    if(result){
        if(!result.readBy){
            result.readBy = data.cmid;
            const saving = await result.save();
            if(saving.error){
                result.readBy = null;
            }
        }
        result = await result.data(false);
    }
    return Channel.message({
        error: false,
        code: code.SUCCESS,
        data: result
    })
}

Wayto.getAllMessages = async (data)=>{
    if(!Filter.contains(data, defaultQuery)){
        return Channel.message({code: code.INVALID});
    }
    if(!(await Manager.checkAuthentification(data.cmid, data.cmtk))) {
        return Channel.message({code: code.LOGOUT})
    }

    const manager = await Manager.getById(data.cmid);
    if(!manager) return Channel.message({code: code.DENIED_ACCESS});
    if(!manager.hasAccess(200, data.bhid)) return Channel.message({code: code.INSUFFICIENT_PRIVILEGE});

    let result = null;
    if('msgid' in data){
        result = await Wayto.readMessage(data,true);
        result = result.data;
    }
    else{
        result = await Messenging.fetchAll(data.bhid);
    }
    return Channel.message({
        error: false,
        code: code.SUCCESS,
        data: result
    })
}

Wayto.replyMessage = async (data)=>{
    if(!Filter.contains(data, [
        ...defaultQuery,
        'msgid','subject','message'
    ], [null, 0, ''])){
        return Channel.message({code: code.INVALID});
    }
    if(!(await Manager.checkAuthentification(data.cmid, data.cmtk))) {
        return Channel.message({code: code.LOGOUT})
    }
    const manager = await Manager.getById(data.cmid);
    if(!manager) return Channel.message({code: code.DENIED_ACCESS});
    if(!manager.hasAccess(201, data.bhid)) return Channel.message({code: code.INSUFFICIENT_PRIVILEGE});

    let message = await Messenging.getById(data.msgid);
    const reply = new MailingReply();
    reply.client = message.client;
    reply.object = data.subject;
    reply.body = data.message;
    reply.createdAt = AkaDatetime.now();
    reply.postOn = reply.createdAt;
    reply.createdBy = data.cmid;
    reply.message = data.msgid;
    const saving = await reply.save();
    if(saving.error) return saving;
    message = await Messenging.getById(data.msgid);
    return Channel.message({
        error: false,
        code: code.SUCCESS,
        data: await message.data()
    })
}

Wayto.deleteMessage = async (data)=>{
    if(!Filter.contains(data, [
        ...defaultQuery,
        'delid'
    ], [null, 0, ''])){
        return Channel.message({code: code.INVALID});
    }
    if(!(await Manager.checkAuthentification(data.cmid, data.cmtk))) {
        return Channel.message({code: code.LOGOUT})
    }
    const manager = await Manager.getById(data.cmid);
    if(!manager) return Channel.message({code: code.DENIED_ACCESS});
    if(!manager.hasAccess(202, data.bhid)) return Channel.message({code: code.INSUFFICIENT_PRIVILEGE});

    let message = await Messenging.getById(data.delid);
    let saving = await message.delete();
    return saving;
}

Wayto.uploadArticleImage = async (data,ths)=>{
    let {upl_artimg = []} = data,
        image = '';
    for(let i in upl_artimg){
        if(await ths.isUploaded(upl_artimg[i])){
            if(await ths.isUploaded(upl_artimg[i])) {
                const dest = await Pictures.nextName('A') + '.' + Pictures.extension(upl_artimg[i]);
                image = '/assets/captions/' + dest;
                await ths.move(upl_artimg[i], DIR.PUBLIC+'/assets/captions/', dest);
            }
        }
    }
    return {
        filename: image
    }
}

Wayto.uploadPunchlineImage = async (data,ths)=>{
    let {pch_img = []} = data,
        image = [];
    for(let i in pch_img){
        if(await ths.isUploaded(pch_img[i])){
            const dest = await Pictures.nextName('P') + '.' + Pictures.extension(pch_img[i]);
            image.push('/assets/captions/'+dest);
            await ths.move(pch_img[i], DIR.PUBLIC+'/assets/captions/', dest);
        }
    }
    return{
        filename: image
    };
}

Wayto.uploadMailImage = async (data,ths)=>{
    let {upl_mailimg = []} = data,
        image = '';
    for(let i in upl_mailimg){
        if(await ths.isUploaded(upl_mailimg[i])){
            const dest = toHexa(Pictures.baseName(upl_mailimg[i]))+'.' + Pictures.extension(upl_mailimg[i]);
            image = '/assets/mailing/'+dest;
            await ths.move(upl_mailimg[i], DIR.PUBLIC+'/assets/mailing/', dest);
        }
    }
    return{
        filename: image
    };
}

Wayto.uploadAvatar = async (data,ths)=>{
    let {avatar = []} = data,
        image = '';
    for(let i in avatar){
        if(await ths.isUploaded(avatar[i])){
            const dest = toHexa(Pictures.baseName(avatar[i]))+'.' + Pictures.extension(avatar[i]);
            image = '/assets/avatar/'+dest;
            await ths.move(avatar[i], DIR.PUBLIC+'/assets/avatar/', dest);
        }
    }
    return{
        filename: image
    };
}

Wayto.getPrivileges = async (data)=>{
    if(!Filter.contains(data, defaultQuery)){
        return Channel.message({code: code.INVALID});
    }
    if(!(await Manager.checkAuthentification(data.cmid, data.cmtk))) {
        return Channel.message({code: code.LOGOUT})
    }
    return Channel.message({
        error: false,
        code: code.SUCCESS,
        data: privileges
    });
}

Wayto.checkIfAvailable = async (data, zone)=>{
    const granted = ['mail', 'nickname'];
    if(granted.indexOf(zone) < 0 || !Filter.contains(data, [...defaultQuery, 'value'])){
        return Channel.message({code: code.INVALID});
    }
    let response = false;
    switch (zone){
        case granted[0]:
            response = await Manager.emailExist(data.value,data.manid);
            break;
        case granted[1]:
            response = await Manager.nicknameExist(data.value,data.manid);
            break;
    }
    return Channel.message({
        code: code.SUCCESS,
        error: false,
        data: !response
    });
}

Wayto.integrateNewManager = async (data)=>{
    if(!Filter.contains(data,[
        ...defaultQuery,
        'firstname', 'lastname', 'nickname', 'email', 'phone', 'auth'
    ], [null, '',0])){
        return Channel.message({code: code.INVALID});
    }
    if(!(await Manager.checkAuthentification(data.cmid, data.cmtk))) {
        return Channel.message({code: code.LOGOUT})
    }

    let manager = await Manager.getById(data.cmid);
    if(!manager) return Channel.message({code: code.DENIED_ACCESS});
    if(!manager.hasAccess(400, data.bhid)) return Channel.message({code: code.INSUFFICIENT_PRIVILEGE});

    const auth = await Manager.connect(data.cmid, data.auth);
    if(auth.error) return auth;

    const update = 'id' in data;
    const selfRequest = update && data.id == data.cmid;

    if(update && !selfRequest && !manager.hasAccess(402, data.bhid)) return Channel.message({code: code.INSUFFICIENT_PRIVILEGE});


    if(!update && (!isset(data.password) || !isset(data.privileges)) ){
        return Channel.message({code: code.INVALID});
    }

    manager = update ? await Manager.getById(data.id) : new Manager();

    if(!manager) return Channel.message({code: code.INVALID});

    if(!update || (update && selfRequest && data.password && data.password.length)){
        manager.code = data.password;
    }
    manager.firstname = data.firstname;
    manager.lastname = data.lastname;
    manager.mail = data.email;
    manager.nickname = data.nickname;
    manager.phone = data.phone;
    if(!update) {
        manager.createdBy = data.cmid;
        manager.createdAt = AkaDatetime.now();
        manager.branches = data.privileges;
        manager.active = true;
    }
    else if(isset(data.privileges)){
        manager.branches = data.privileges;
    }

    return await manager.save();
}

Wayto.resetManagerPassword = async (data)=>{
    if(!Filter.contains(data, [...defaultQuery, 'psw', 'auth', 'manid'])){
        return Channel.message({code:code.INVALID});
    }
    if(!(await Manager.checkAuthentification(data.cmid, data.cmtk))) {
        return Channel.message({code: code.LOGOUT})
    }

    let manager = await Manager.getById(data.cmid);
    if(!manager) return Channel.message({code: code.DENIED_ACCESS});
    if(!manager.hasAccess(401, data.bhid)) return Channel.message({code: code.INSUFFICIENT_PRIVILEGE});

    const auth = await Manager.connect(data.cmid, data.auth);
    if(auth.error) return auth;

    manager = await Manager.getById(data.manid);

    if(!manager) return Channel.message({code: code.INVALID});

    manager.code = data.psw;

    return await manager.save();
}

Wayto.blockManager = async (data)=>{
    if(!Filter.contains(data, [...defaultQuery, 'block', 'auth', 'manid'])){
        return Channel.message({code:code.INVALID});
    }
    if(!(await Manager.checkAuthentification(data.cmid, data.cmtk))) {
        return Channel.message({code: code.LOGOUT})
    }

    let manager = await Manager.getById(data.cmid);
    if(!manager) return Channel.message({code: code.DENIED_ACCESS});
    if(!manager.hasAccess(408, data.bhid)) return Channel.message({code: code.INSUFFICIENT_PRIVILEGE});

    const auth = await Manager.connect(data.cmid, data.auth);
    if(auth.error) return auth;

    manager = await Manager.getById(data.manid);

    if(!manager) return Channel.message({code: code.INVALID});

    manager.active = data.block;

    return await manager.save();
}

Wayto.getAllManagers = async (data)=>{
    console.log('[Data]',data);
    if(!Filter.contains(data, defaultQuery)){
        return Channel.message({code: code.INVALID});
    }
    if(!(await Manager.checkAuthentification(data.cmid, data.cmtk))) {
        return Channel.message({code: code.LOGOUT})
    }

    return Channel.message({
        code: code.SUCCESS,
        error: false,
        data: await Manager.filter(data.bhid, [data.cmid])
    });
}

Wayto.getManager = async (data)=>{
    if(!Filter.contains(data, [...defaultQuery, 'manid'])){
        return Channel.message({code: code.INVALID});
    }
    if(!(await Manager.checkAuthentification(data.cmid, data.cmtk))) {
        return Channel.message({code: code.LOGOUT})
    }

    const manager = await Manager.getById(data.manid);

    if(!manager) return Channel.message({code: code.INVALID});

    return Channel.message({
        error: false,
        code: code.SUCCESS,
        data: await manager.data()
    });
}

Wayto.setManagerAvatar = async (data)=>{
    if(!Filter.contains(data, [...defaultQuery, 'res'])){
        return Channel.message({code: code.INVALID});
    }
    if(!(await Manager.checkAuthentification(data.cmid, data.cmtk))) {
        return Channel.message({code: code.LOGOUT})
    }

    const manager = await Manager.getById(data.cmid);

    if(!manager) return Channel.message({code: code.INVALID});

    return await manager.setAvatar(data.res);
}

Wayto.commitCategories = async (data, sector)=>{
    if(!Filter.contains(data, [...defaultQuery, 'save', 'del'])){
        return Channel.message({code:code.INVALID});
    }
    if(!(await Manager.checkAuthentification(data.cmid, data.cmtk))) {
        return Channel.message({code: code.LOGOUT})
    }

    // let manager = await Manager.getById(data.cmid);
    // if(!manager) return Channel.message({code: code.DENIED_ACCESS});
    // if(!manager.hasAccess(408, data.bhid)) return Channel.message({code: code.INSUFFICIENT_PRIVILEGE});

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
    if(!Filter.contains(data, [ ...defaultQuery,
        'title','content', 'img', 'category',
        'schdate'
    ])){
        return Channel.message({
            code: code.INVALID
        });
    }
    if(!(await Manager.checkAuthentification(data.cmid, data.cmtk))) {
        return Channel.message({code: code.LOGOUT})
    }

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

Wayto.commitPunchline = async (data)=>{
    if(!Filter.contains(data, [
        ...defaultQuery,
        'title','year','artist', 'category',
        'punchline', 'res'
    ], [null,0,''])){
        return Channel.message({code: code.INVALID});
    }
    if(!(await Manager.checkAuthentification(data.cmid, data.cmtk))) {
        return Channel.message({code: code.LOGOUT})
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

Wayto.getEssentialsSettings = async (data)=>{
    if(!Filter.contains(data, defaultQuery)){
        return Channel.message({code: code.INVALID});
    }
    if(!(await Manager.checkAuthentification(data.cmid, data.cmtk))) {
        return Channel.message({code: code.LOGOUT})
    }

    let response = {};

    response.readingVisible = Boolean(set(await Sys.get('readingVisible'+data.bhid), 0) * 1);
    response.likesVisible = Boolean(set(await Sys.get('likesVisible'+data.bhid), 0) * 1);
    response.authorVisible = Boolean(set(await Sys.get('authorVisible'+data.bhid), 0) * 1);
    response.readingVisibleWithCondition = Boolean(set(await Sys.get('readingVisibleWithCondition'+data.bhid), 0) * 1);;
    response.readingVisibilitylimit = set(await Sys.get('readingVisibilitylimit'+data.bhid), 100) * 1;
    response.likesVisibleWithCondition = Boolean(set(await Sys.get('likesVisibleWithCondition'+data.bhid), 0) * 1);;
    response.likesVisiblitylimit = set(await Sys.get('likesVisiblitylimit'+data.bhid), 100) * 1;
    response = {...response, ...(await Wayto.getPunchlinesConfig(data)).data};
    response.branches = await Branch.fetchAll();
    response.sponsoredArticles = await Articles.getSponsored(data.bhid, true);
    response.sponsoredPunchlines = await Punchlines.fetchAll(data.bhid, true, false, true);

    return Channel.message({
        error: false,
        code: code.SUCCESS,
        data: response
    });
}

Wayto.setEssentialsSettings = async (data)=>{
    if(!Filter.contains(data, defaultQuery)){
        return Channel.message({code: code.INVALID});
    }
    if(!(await Manager.checkAuthentification(data.cmid, data.cmtk))) {
        return Channel.message({code: code.LOGOUT})
    }

    let error = [];
    let handle = (config, result)=>{
        if(result.error){
            error.push({code: result.code, config});
        }
    }
    const manager = await Manager.getById(data.cmid);
    //visibility setup
    if(Filter.contains(data, [
        'readingVisible','likesVisible', 'authorVisible',
        'readingVisibilitylimit', 'likesVisibilitylimit',
        'readingVisibleWithCondition', 'likesVisibleWithCondition'
    ])){
        handle('readingVisible',await Sys.set('readingVisible'+data.bhid, data.readingVisible ? 1 : 0));
        handle('likesVisible',await Sys.set('likesVisible'+data.bhid,data.likesVisible ? 1 : 0));
        handle('authorVisible',await Sys.set('authorVisible'+data.bhid, data.authorVisible ? 1 : 0));
        handle('readingVisibilitylimit',await Sys.set('readingVisibilitylimit'+data.bhid, data.readingVisibilitylimit));
        handle('likesVisibilitylimit',await Sys.set('likesVisibilitylimit'+data.bhid, data.likesVisibilitylimit));
        handle('readingVisibleWithCondition',await Sys.set('readingVisibleWithCondition'+data.bhid, data.readingVisibleWithCondition));
        handle('likesVisibleWithCondition',await Sys.set('likesVisibleWithCondition'+data.bhid, data.likesVisibleWithCondition));
    }

    //punchline default settings
    if(Filter.contains(data, [
        'cardWidth', 'cardHeight','cardBg','cardBandBg','cardTextColor','cardBandColor'
    ])){
        handle('cardWidth',await Sys.set('cardWidth'+data.bhid, data.cardWidth));
        handle('cardHeight',await Sys.set('cardHeight'+data.bhid, data.cardHeight));
        handle('cardBg',await Sys.set('cardBg'+data.bhid, data.cardBg));
        handle('cardBandBg',await Sys.set('cardBandBg'+data.bhid, data.cardBandBg));
        handle('cardTextColor',await Sys.set('cardTextColor'+data.bhid, data.cardTextColor));
        handle('cardBandColor',await Sys.set('cardBandColor'+data.bhid, data.cardBandColor));
    }

    //sponsoring
    let list = ['sponsoredArticles','sponsoredPunchlines'];
    if(Filter.contains(data, list)){
        let sponsor;
        for(let index of list) {
            for (let item of data.sponsoredArticles) {
                sponsor = await (item === list[0] ? Articles : Punchlines).getById(item.id);
                if (sponsor) {
                    handle(item.title,await sponsor.sponsorUntil(item.sponsoredUntil));
                }
            }
        }
    }

    //branch creation/edition
    if(Filter.contains(data, ['branches'])){
        let branch, saving;
        for(let branchData of data.branches){
            branch = branchData.id ? (await Branch.getById(branchData.id)) : new Branch();
            if(branch) {
                branch.name = branchData.name;
                branch.domain = branchData.domain;
                if (!branchData.id) {
                    branch.createdAt = AkaDatetime.now();
                }
                saving = await branch[branchData.delete ? 'delete' : 'save']();
                if(!branchData.delete && !saving.error && !branchData.id){
                    manager.branches[saving.data.id] = manager.branches[data.bhid];
                    handle('assignation', await manager.save());
                }
                handle(branch.name, saving);
            }
            else{
                handle(branchData.name, Channel.message({code: code.BRANCH_ERROR}))
            }
        }
    }

    return Channel.message({
        error: false,
        message: error,
        code: code.SUCCESS,
        data: await Wayto.getEssentialsSettings(Filter.object(data, defaultQuery))
    });
}

module.exports = Wayto;