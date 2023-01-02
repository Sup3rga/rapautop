let {Connect,Channel, Pdo} = require('../utils/Connect'),
    Data = require('./Data'),
    AkaDatetime = require('../utils/AkaDatetime'),
    Filter = require('../utils/Filter');
const {promisify} = require('util');

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
        this.token = null;
        this.branches = [];
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

    async hydrate(data) {
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
        await this.fetchBranch();
        return this;
    }

    async fetchBranch(){
        let result = await Connect.query("select distinct b.id, b.domain from communauty c, branch b where c.manager=? and c.branch=b.id",[
            this.id
        ]);
        if(result.length){
            for(let i in result){
                this.branches.push({
                    id: result[i].id,
                    domain: result[i].domain
                });
            }
        }
    }

    async data(publicMode = true, personal= false, essentials=false){
        let list = essentials ? ['id', 'firstname', 'lastname'] :
        [
            'id','firstname','lastname','mail','nickname','access',
            'phone','createdAt','createdBy','active','branches'
        ];
        if(personal){
            list.push('token');
        }
        const data = Filter.object(this,list);
        const creator = data.createdBy ? await Manager.getById(data.createdBy) : null;
        if(creator) {
            data.createdBy = await creator.data(true, false, true);
        }
        return data;
    }

    async checkConnection(){
        let online = null;

        if(!this.saved) return online;

        let data = await Connect.query("select last_seen, token from session_trace where client=?",[
            this.id
        ]);

        if(data.length){
            let date,
                diff,
                timeout = new AkaDatetime("00:15:00"),
                now = new AkaDatetime(new Date());
            for(let i in data){
                date = new AkaDatetime(data[i].last_seen);
                diff = AkaDatetime.diff(now, date);
                if(diff.isLessThan(timeout)){
                    online = data[i].token;
                    break;
                }
            }
        }

        return online;
    }

    async setSession(){
        if(!this.saved) return;
        let onlineToken = await this.checkConnection();
        if(onlineToken){
           await Connect.query("update session_trace set last_seen=?",[
               new AkaDatetime(new Date()).getDateTime()
           ]);
        }
        else{
            let date = new Date(),
                now = new AkaDatetime(date).getDateTime();
            try {
                await Connect.query("insert into session_trace (client, token, created_at, last_seen) values(?,SHA1(?),?,?)", [
                    this.id,
                    date,
                    now,
                    now
                ]);
                onlineToken = await this.checkConnection();
            }catch (e){
                return;
            }
        }
        this.token = onlineToken;
    }

    setOnline(){
        Manager.connected.push(this);
        return this;
    }

    setOffline(){
        Manager.connected = Manager.connected.filter((man)=>{
            if(man != this) return false;
        });
        return this;
    }

    static async getById(id){
        let manager = null;
        try{
            const request = await Pdo.prepare("select * from manager where id=:id")
                .execute({id});
            if(request.rowCount){
                manager = new Manager().hydrate(request.fetch());
            }
        }catch (e){
            Channel.logError(e);
        }
        return manager;
    }

    static async connect(username,password){
      let result = await Connect.query("select * from manager where nickname=? and code=SHA1(?)",[username,password]);
      if(!result.length){
          return Channel.message();
      }
      let man = await new Manager().hydrate(result[0]);
       await man.setOnline().setSession();
       return Channel.message({
           error: false,
           message: "Success",
           data: await man.data(true, true)
       });
    }
}

module.exports = Manager;