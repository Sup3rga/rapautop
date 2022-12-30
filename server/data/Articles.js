let {Pdo} = require('../utils/Connect'),
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
        console.log('[This]',this);
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
                await Pdo.prepare(`
                    insert into articles (
                      title,caption,content,created_at,created_by,modified_at,modified_by,
                      category,branch,post_on
                    )
                    values(:p1,:p2,:p3,:p4,:p5,:p4,:p5,:p6,:p7,:p8)
                `)
                .execute({
                    p1: this.title,
                    p2: this.caption,
                    p3: this.content,
                    p4: new AkaDatetime(this.createdAt).getDateTime(),
                    p5: this.createdBy,
                    p6: this.category,
                    p7: this.branch,
                    p8: new AkaDatetime(this.postOn).getDateTime()
                });
                return Channel.message({error: false, code: code.SUCCESS});
            }catch(e){
                return Channel.logError(e).message({code: code.INTERNAL});
            }
        }
        try{
            await Pdo.prepare(`
                update articles set title = :p1, caption = :p2, content = :p3,
                modified_by = :p5 , modified_at = :p4, category = :p6
                where id = :p7 and branch = :p8
            `)
            .execute({
                p1: this.title,
                p2: this.caption,
                p3: this.content,
                p4: new AkaDatetime(this.createdAt).getDateTime(),
                p5: this.createdBy,
                p6: this.category,
                p7: this.id,
                p8: this.branch
            })
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
            await Pdo.prepare("delete from articles where id=?")
                .execute({id: this.id});
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

    static async getById(id){
        let article = null;
        try{
            const req = await Pdo.prepare("select * from articles where id=:id")
                .execute({id});
            if(req.rowCount){
                article = new Articles().hydrate(req.fetch());
            }
        }catch(e){
            Channel.logError(e);
        }
        return article;
    }

    static async fetchAll(branch = 0){
        let result = [];
        try {
            const req = await Pdo.prepare("select * from articles where branch=:branch")
                .execute({branch});
            let data;
            while(data = req.fetch()){
                result.push(new Articles().hydrate(data).data());
            }
        }catch(e){
            Channel.logError(e);
        }
        return result;
    }
}

module.exports = Articles;