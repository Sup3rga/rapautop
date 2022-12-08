let {Connect,Channel} = require('../utils/Connect'),
    Data = require('./Data'),
    Filter = require('../utils/Filter');

class Manager extends Data{
    static list = [];
    static connected = [];

    constructor() {
        super();
        this.id = 0;
        this.firstname = null;
        this.lastname = null;
        this.mail = null;
        this.access = [];
        this.nickname = null;
        this.phone = null;
        this.createdAt = null;
        this.createdBy = null;
        this.active = false;
        this.saved = false;
    }

    save(){
        return new Promise((res)=>{
            let sql = !this.saved ?
                "update manager set firstname=?,lastname=?,mail=?,access=?,nickname=?,phone=?,active=? where id=?"
                :
                "insert into manager(firstname, lastname, mail, access, nickname, phone, active, code, created_at, created_by,) " +
                "values(?,?,?,?,?,?,?,?,?,?)",
                options = [
                  this.firstname,
                  this.lastname,
                  this.mail,
                  this.access.join(','),
                  this.nickname,
                  this.phone,
                  this.active ? 1 : 0
                ];
            if(!this.saved){
                options.push(this.code);
                options.push(this.createdAt);
                options.push(this.createdBy);
            }
            else{
                options.push(this.id);
            }
            Connect.query(sql,options).then(()=>{
               res(Channel.message({
                   error: false,
                   message: "succesful saving !"
               }));
            }).catch((err)=>{
                res(Channel.message());
            });
        });
    }

    delete(){
        return new Promise((res)=>{
            if(!this.saved){
                return res(Channel.message());
            }
            Connect.query("delete from manager where id=?",[this.id])
            .then(()=>{
                res(Channel.message({
                    error: false,
                    message: "successful deletion"
                }));
            })
            .catch(()=>{
                res(Channel.message());
            });
        });
    }


    hydrate(data) {
        this.id = data.id;
        this.firstname = data.firstname;
        this.lastname = data.lastname;
        this.mail = data.mail;
        this.access = data.access;
        this.nickname = data.nickname;
        this.phone = data.phone;
        this.createdAt = data.created_at;
        this.createdBy = data.created_by;
        this.active = data.active == 1;
        this.saved = true;
        return this;
    }

    data(){
        return Filter.object(this,[
            'id','firstname','lastname','mail','nickname','access',
            'phone','createdAt','createdBy','active'
        ]);
    }

    static connect(username,password){
        return new Promise((res)=>{
           Connect.query("select * from manager where nickname=? and code=SHA1(?)",[username,password])
               .then((result)=>{
                   let man = new Manager().hydrate(result[0]);
                   Manager.connected.push(man);
                   res(Channel.message({
                       data: man.data()
                   }));
               })
        });
    }
}

module.exports = Manager;