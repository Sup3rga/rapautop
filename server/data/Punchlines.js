const TracableData = require("./TracableData");
const Filter = require("../utils/Filter");
const Pictures = require("./Pictures");
const Category = require("./Category");
const code = require("../utils/ResponseCode");
const Channel = require("../utils/Channel");
const {Pdo} = require("../utils/Connect");
const {in_array} = require("../utils/procedures");
const AkaDatetime = require("../utils/AkaDatetime");
const Manager = require("./Manager");

class Punchlines extends TracableData{

    constructor() {
        super();
        this.id = 0;
        this.title = null;
        this.picture = 0;
        this.card = 0;
        this.year = 0;
        this.artist = null;
        this.lyrics = null;
        this.punchline = null;
        this.category = 0;
        this.comment = null;
        this.postOn = null;
    }

    async data(_public = true){
        const data = Filter.object(this, [
            'id','title', 'picture', 'card', 'year', 'artist', 'lyrics', 'punchline',
            'category', 'comment', 'postOn',
            'createdBy','createdAt','modifiedAt','modifiedBy', 'branch',
        ]);
        data.card = (await Pictures.getById(data.card)).data();
        if(!_public) {
            data.picture = (await Pictures.getById(data.picture)).data();
            data.category = await (await Category.getById(data.category)).data();
            data.createdBy = await (await Manager.getById(data.createdBy)).data(true, false, true);
            data.modifiedBy = await (await Manager.getById(data.modifiedBy)).data(true, false, true);
        }
        else{
            data.card = data.card.path;
            Filter.flush(data, [
                'createdBy','createdAt', 'picture',
                'modifiedAt', 'modifiedBy'
            ]);
        }
        return data;
    }

    hydrate(data) {
        this.id = data.id;
        this.title = data.title;
        this.picture = data.presentation;
        this.card = data.picture;
        this.punchline = data.punchline;
        this.year = data.year;
        this.lyrics = data.lyrics;
        this.category = data.category;
        this.artist = data.artist;
        this.comment = data.comment;
        this.branch = data.branch;
        this.createdBy = data.created_by;
        this.createdAt = new AkaDatetime(data.created_at).getDateTime();
        this.modifiedBy = data.modified_by;
        this.modifiedAt = new AkaDatetime(data.modified_at).getDateTime();
        return this;
    }

    async savePicture(path){
        const picture = new Pictures();
        picture.path = path;
        picture.createdBy = this[this.id ? 'modifiedBy' : 'createdBy'];
        picture.createdAt = this[this.id ? 'modifiedBy' : 'createdBy'];
        return await picture.save();
    }

    async save(){
        let _code = code.SUCCESS;
        if(!Filter.contains(this, [
            'title', 'picture','card','punchline', 'year','artist', 'punchline',
            'createdBy', 'createdAt', 'postOn'
        ], [null,0,'']) ||
            (
                this.id && !Filter.contains(this, [
                    'modifiedAt','modifiedBy'
                ])
            )
        ){
            return Channel.message({code: code.INVALID});
        }
        try {
            let _self, old, saving,
                updatable = this.id && [typeof this.picture, typeof  this.card].indexOf('string') >= 0;
            if(updatable) {
                _self = await Punchlines.getById(this.id);
            }
            const _job = async (index)=>{
                if(typeof this[index] === 'string'){
                    saving = await this.savePicture(this[index]);
                    if(updatable) {
                        old = await Pictures.getById(_self[index]);
                    }
                    if(!saving.error) {
                        if(updatable) {
                            await old.delete();
                        }
                        this[index] = saving.data.id;
                    }
                    else{
                        _code = code.PICTURE_UPDATE_ERROR;
                        if(updatable) {
                            this[index] = old.id;
                        }
                        else{
                            return Channel.message({code: _code})
                        }
                    }
                }
            }

            let task;
            if(task = await _job('picture')) return task;
            if(task = await _job('card')) return task;

            const base = {
                p1: this.picture,
                p2: this.card,
                p3: this.title,
                p4: this.artist,
                p5: this.lyrics,
                p6: this.punchline,
                p7: this.year,
                p8: this.category,
                p9: this.comment,
                p12: this.postOn,
            }
            if(!this.id) {
                await Pdo.prepare(`
                    insert into punchlines(presentation, picture, title, artist, lyrics, punchline, year, category,
                                           comment, created_at, created_by, modified_at, modified_by, post_on, branch)
                    values (:p1, :p2, :p3, :p4, :p5, :p6, :p7, :p8, :p9, :p10, :p11, :p10, :p11, :p12, :p13)
                `).execute({
                    ...base,
                    p10: this.createdAt,
                    p11: this.createdBy,
                    p13: this.branch
                });
            }else{
                await Pdo.prepare(`
                    update punchlines set
                        presentation=:p2, picture = :p1, title = :p3, artist = :p4,
                        lyrics=:p5, punchline=:p6, year=:p7, category=:p8, comment=:p9,
                        modified_at=:p10, modified_by=:p11, post_on=:p12
                    where id = :p13
                `).execute({
                    ...base,
                    p10: this.modifiedAt,
                    p11: this.modifiedBy,
                    p13: this.id
                });
            }
        }catch (e){
            return Channel.logError(e).message({code: code.INTERNAL});
        }
        return Channel.message({
            error: false,
            code : _code
        });
    }

    static async getById(id){
        let punchline = null;
        try{
            const request = await Pdo.prepare("select * from punchlines where id=:p1").execute({id});
            if(request.rowCount){
                punchline = new Punchlines().hydrate(request.fetch());
            }
        }catch (e){
            Channel.logError(e);
        }
        return punchline;
    }

    static async fetchAll(branch = 0, dataOnly = true, _public = false){
        const r = [];
        try{
            const results = await Pdo.prepare("select * from punchlines where branch=:branch")
                .execute({branch});
            let data;
            while(data = results.fetch()){
                r.push(await new Punchlines().hydrate(data).data(_public));
            }
        }catch (e){
            Channel.logError(e);
        }
        return r;
    }

    static async fetchYears(branch){
        const list = [];
        try{
            const request = await Pdo.prepare("select year from punchlines where branch=:branch")
                .execute({branch});
            let data;
            while(data = request.fetch()){
                if(!in_array(list, data.year, true)){
                    list.push(data.year);
                }
            }
        }catch (e){
            Channel.logError(e);
        }
        return list;
    }

    static async fetchArtists(branch){
        const list = [];
        try{
            const request = await Pdo.prepare("select artist from punchlines where branch=:branch")
                .execute({branch});
            let data;
            while(data = request.fetch()){
                if(!in_array(list, data.artist, true)){
                    list.push(data.artist);
                }
            }
        }catch (e){
            Channel.logError(e);
        }
        return list;
    }
}

module.exports = Punchlines;