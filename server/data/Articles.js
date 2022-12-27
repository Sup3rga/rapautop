let {Connect} = require('../utils/Connect'),
    Channel = require('../utils/Channel'),
    AkaDatetime = require('../utils/AkaDatetime'),
    Data = require('./Data');

class Articles extends Data{
    static list = [];
    constructor() {
        super();
        this.id = 0;
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
        this.saved = false;
    }
    save(){
        return new Promise((res,rej)=>{
            let options = [
              this.caption, this.content,
              new AkaDatetime(this.createdAt).getDateTime(),
              this.createdBy,
              new AkaDatetime(this.modifiedAt).getDateTime(),
              this.modifiedBy,
              this.reading,
              this.likes,
              this.dislikes,
              this.category,
              this.branch,
              new AkaDatetime(this.postOn).getDateTime(),
            ],
            sql = !this.saved ?
                "insert into articles(" +
                "caption,content, created_at, created_by, modified_at, modified_by, reading, likes, dislikes," +
                "category,branch,post_on" +
                ") values(?,?,?,?,?,?,?,?,?,?,?,?)"
                :
                "update articles set caption=?, content=?,modified_at=?,modified_by=?,reading=?,likes=?," +
                "dislikes=?,category=?,branch=?,post_on=?";

            Connect.query(sql, options).then(()=>{
                res(Channel.message({
                    error: false,
                    message: "successful saving !"
                }))
            }).catch((err)=>{
                res(Channel.message({
                    message: "an error during the operation"
                }))
            });
        });
    }

    delete(){
        return new Promise((res)=>{
           if(!this.saved){
               res(Channel.message());
           }
           Connect.query("delete from articles where ?", {
               id: this.id
           }).then(()=>{
               res(Channel.message({
                   error: false,
                   message: "successful deletion"
               }))
           }).catch((err)=>{
               res(Channel.message());
           })
        });
    }

    hydrate(data){
        console.log('[data]', data);
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

    static fetchAll(){
        Articles.list = [];
        Connect.query("select * from articles",null,true).then((e)=>{
            Articles.list.push(new Articles().hydrate(e));
        });
    }
}

module.exports = Articles;