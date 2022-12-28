let {Connect} = require('../utils/Connect'),
    Channel = require('../utils/Channel'),
    Filter = require('../utils/Filter'),
    AkaDatetime = require('../utils/AkaDatetime'),
    code = require('../utils/ResponseCode'),
    Data = require('./Data');

class Articles extends Data{
    static list = [];

    constructor() {
        super();
        this.id = 0;
        this.title = null;
        this.caption = null;
        this.content = null;
        this.createdAt = null;
        this.createdBy = null;
        this.modifiedAt = null;
        this.modifiedBy = null;
        this.reading = 0;
        this.likes = 0;
        this.dislikes = 0;
        this.category = 0;
        this.branch = 0;
        this.postOn = null;
    }

    data(){
        return Filter.object(this, [
           'id', 'title', 'caption','content',
           'createdAt', 'createdBy', 'modifiedAt',
           'modifiedBy', 'reading', 'likes','dislikes',
           'category', 'branch', 'postOn'
        ]);
    }

    async save(){
        if(!Filter.contains(this, [
            'title','content','createdAt','createdBy','branch', 'postOn','category'
        ], [null, 0, ''])){
            return Channel.message({code: code.INVALID});
        }
        if(this.id && !Filter.contains(this, ['modifiedBy', 'modifiedAt'])){
            return Channel.message({code: code.INVALID});
        }
        if(!this.id){
            try{
                await Connect.query(`
                    insert into articles (
                      title,caption,content,created_at,created_by,modified_at,modified_by,
                      category,branch,post_on
                    )
                    values(?,?,?,?,?,?,?,?,?,?)
                `, [
                    this.title, this.caption, this.content,
                    new AkaDatetime(this.createdAt).getDateTime(), this.createdBy,
                    new AkaDatetime(this.createdAt).getDateTime(), this.createdBy,
                    this.category, this.branch,
                    new AkaDatetime(this.postOn).getDateTime()
                ])
                return Channel.message({error: false, code: code.SUCCESS});
            }catch(e){
                return Channel.logError(e).message({code: code.INTERNAL});
            }
        }
        try{
            await Connect.query(`
                update articles set title = ?, caption = ?, content = ?,
                modified_by = ? , modified_at = ?, category = ?
                where id = ?
            `,[
                this.title, this.caption, this.content, this.modifiedBy,
                new AkaDatetime(this.modifiedAt).getDateTime(),
                this.category, this.id
            ]);
        }catch (e){
            return Channel.logError(e).message({code: code.INTERNAL});
        }
        return Channel.message({error: false, code: code.SUCCESS});
    }

    async delete(){
        if(!this.id){
            return Channel.message({code: code.INVALID});
        }
        try {
            await Connect.query(`
                delete
                from articles
                where id = ?
            `, [this.id]);
        }catch(e){
            return Channel.logError(e).message({code: code.INTERNAL});
        }
        return Channel.message({error: false, code: code.SUCCESS});
    }

    hydrate(data){
        this.id = data.id;
        this.title = data.title;
        this.content = data.content;
        this.createdBy = data.created_by;
        this.createdAt = data.created_at;
        this.modifiedAt = data.modified_at;
        this.modifiedBy = data.modified_by;
        this.reading = data.reading;
        this.likes = data.likes;
        this.dislikes = data.dislikes;
        this.category = data.category;
        this.branch = data.branch;
        this.postOn = data.post_on;
        return this;
    }

    static getById(id){
        let occurence = null;
        Articles.list.forEach((article)=>{
            if(article.id == id){
                occurence = article;
                return 0;
            }
        });
        return occurence;
    }

    static async fetchAll(branch = 0){
        let list = await Connect.query("select * from articles where branch=?",[
            branch
        ], true),
        result = [];
        for(let i in list){
            result.push(new Articles().hydrate(list[i]).data());
        }
        return result;
    }
}

module.exports = Articles;