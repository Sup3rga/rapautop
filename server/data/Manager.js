let {Connect,Channel, Pdo} = require('../utils/Connect'),
    Data = require('./Data'),
    AkaDatetime = require('../utils/AkaDatetime'),
    Filter = require('../utils/Filter');
const {promisify} = require('util');
const code = require('../utils/ResponseCode');
const {groups,summary} = require('./Privileges');
const {is_file} = require('../utils/procedures');
const Pictures = require('./Pictures');

class Manager extends Data{
    static list = [];
    static connected = [];

    constructor() {
        super();
        this.id = 0;
        this.firstname = null;
        this.lastname = null;
        this.mail = null;
        this.nickname = null;
        this.phone = null;
        this.avatar = 0;
        this.createdAt = null;
        this.createdBy = null;
        this.active = false;
        this.saved = false;
        this.token = null;
        this.branches = {};
        this.status = {};
        this.level = {};
        this.branchesData = {};
    }

    async updateBranchAssignation(){
        let arg;
        for(let i in this.branches){
            try {
                arg = {
                    p1: this.branches[i].join(','),
                    p2: i,
                    p3: this.id
                };
                if (await this.workForBranch(i)) {
                    await Pdo.prepare(`
                        update communauty set access=:p1 where
                        branch=:p2 and manager=:p3
                    `).execute(arg);
                } else {
                    await Pdo.prepare(`
                        insert into communauty(branch, manager, access)
                        values(:p2,:p3,:p1) 
                    `).execute(arg);
                }
            }catch (e){
                Channel.logError(e);
            }
        }
    }

    async save(){
        /**
         * Special case for super admin
         */
        if(this.id && this.createdBy == null){
            this.createdBy = this.id;
        }
        if(!Filter.contains(this, [
            'firstname', 'lastname', 'mail', 'nickname', 'phone',
            'createdAt', 'createdBy'
        ], [null, '', 0]) ||
            (!this.id && (!this.code || !this.code.length))
        ){
            return Channel.message({code: code.INVALID});
        }
        let current = this;
        /**
         * correction
         */

        if(this.createdBy === this.id) this.createdBy = null;

        try{
            const base = {
                p1: this.firstname,
                p2: this.lastname,
                p3: this.mail,
                p5: this.nickname,
                p6: this.phone,
                p7: this.createdAt,
                p8: this.createdBy,
                p9: this.active ? 1 : 0
            }
            if(this.code){
                base.p4 = this.code
            }
            if(!this.id){
                await Pdo.prepare(`
                    insert into manager (firstname, lastname, mail, ${this.code ? 'code,' : ''} nickname, phone, created_at, created_by, active) 
                    values (:p1,:p2,:p3,${this.code ? 'SHA1(:p4),': ''}:p5,:p6,:p7,:p8,:p9)
                `).execute(base);
                current = await Manager.getLast(this);
                this.id = current.id;
                Manager.list.push(current);
            }
            else{
                console.log('[Base]',base);
                base.p10 = this.id;
                await Pdo.prepare(`
                    update manager set
                    firstname=:p1, lastname=:p2, mail=:p3,
                    ${this.code ? 'code=SHA1(:p4),' : ''} 
                    nickname=:p5, phone=:p6, created_at=:p7,
                    created_by=:p8, active=:p9 where id=:p10
                `).execute(base);
            }
        }catch (e){
            return Channel.logError(e).message({code: code.INTERNAL});
        }
        await this.updateBranchAssignation();
        return Channel.message({
            error: false,
            code: code.SUCCESS,
            data: await current.data()
        });
    }

    delete(){
    }

    async hydrate(data) {
        this.id = data.id;
        this.firstname = data.firstname;
        this.lastname = data.lastname;
        this.avatar = data.avatar;
        this.mail = data.mail;
        this.nickname = data.nickname;
        this.phone = data.phone;
        this.createdAt = new AkaDatetime(data.created_at).getDateTime();
        this.createdBy = data.created_by;
        this.active = data.active * 1 == 1;
        this.saved = true;
        await this.fetchBranch();
        return this;
    }

    async fetchBranch(){
        let result = await Connect.query("select distinct b.id, b.domain, b.name, c.access from communauty c, branch b where c.manager=? and c.branch=b.id",[
            this.id
        ]);
        if(result.length){
            for(let i in result){
                this.branches[result[i].id] = result[i].access.split(',');
                this.branchesData[result[i].id] = {
                    id: result[i].id,
                    name: result[i].name,
                    domain: result[i].domain
                };
            }
        }
        let levels;
        for(let i in this.branches){
            this.status[i] = [];
            levels = {};
            for(let j in this.branches[i]){
                for(let k in groups){
                    if(
                        this.branches[i][j] >= groups[k][0] &&
                        this.branches[i][j] <= groups[k][1]
                    ){
                        if(!(k in levels)){
                            levels[k] = 0;
                        }
                        levels[k]++;
                        if(this.status[i].indexOf(k) < 0) {
                            this.status[i].push(k);
                        }
                    }
                }
            }
            for(let j in levels){
                levels[j] = Math.floor(levels[j] / summary[j] * 10000)/100;
            }
            this.level[i] = levels;
        }
    }

    async data(publicMode = true, personal= false, essentials=false){
        let list = ['id', 'firstname', 'lastname', 'avatar'];
        if(!essentials) {
            list = [ ...list,
                'mail', 'nickname', 'status', 'level',
                'phone', 'createdAt', 'createdBy', 'active',
                'branches', 'branchesData'
            ];
        }
        if(personal){
            list.push('token');
        }
        const data = Filter.object(this,list);
        if(data.avatar) {
            data.avatar = await Pictures.getById(data.avatar);
            data.avatar = data.avatar.path;
        }
        const creator = data.createdBy ? await Manager.getById(data.createdBy) : null;
        // console.log('[creator]',this.id, creator, data.createdBy);
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

    async setAvatar(avatar){
        if(!this.id) return Channel.message({code: code.INVALID});
        if(!(await is_file(DIR.PUBLIC+avatar))){
            return Channel.message({code: code.PICTURE_UPDATE_ERROR});
        }
        const picture = new Pictures();
        picture.createdBy = this.id;
        picture.createdAt = AkaDatetime.now();
        picture.path = avatar;
        const oldAvatar = this.avatar ? await Pictures.getById(this.avatar) : null;
        const saving = await picture.save();
        if(saving.error) return saving;
        this.avatar = saving.data.id;
        try{
            await Pdo.prepare('update manager set avatar=:p1 where id=:p2')
                .execute({p1: this.avatar, p2: this.id});
        }catch (e){
            return Channel.logError(e).message({code: code.INTERNAL});
        }
        if(oldAvatar){
            await oldAvatar.delete();
        }
        return Channel.message({
            error: false,
            code: code.SUCCESS,
            data: await this.data()
        });
    }

    async workForBranch(branch){
        try{
            const req = await Pdo.prepare("select * from communauty where branch=:branch and manager=:id")
                .execute({branch, id: this.id});
            return req.rowCount > 0;
        }catch (e){
            Channel.logError(e);
            return false;
        }
    }

    static async getById(id){
        for(let i in Manager.list){
            if(Manager.list[i].id == id){
                return Manager.list[i];
            }
        }
        return null;
    }

    static async fetchAll(){
        try{
            const req = await Pdo.prepare("select distinct  * from manager")
                .execute();
            // console.trace('[Man][list][ttl]..',Manager.list.length, req.rowCount);
            let data;
            Manager.list = [];
            console.log('[Before]',req.rowCount);
            while(data = req.fetch()){
                Manager.list.push(await new Manager().hydrate(data));
            }
            console.log('<Man>[total]',Manager.list.length);
        }catch (e){
            Channel.logError(e);
        }
    }

    static async getLast(src=null){
        let manager = null,
            queue = "",
            arg = {};
        if(src){
            queue = 'where created_by=:p1 and created_at=:p2';
            arg = {p1: src.createdBy, p2: new AkaDatetime(src.createdAt).getDateTime()};
        }
        try{
            const req = await Pdo.prepare("select * from manager "+queue+" order by id desc LIMIT 1")
                .execute(arg);
            if(req.rowCount){
                manager = new Manager().hydrate(req.fetch());
            }
        }catch(e){
            Channel.logError(e);
        }
        return manager;
    }

    static async connect(username,password){
      const withId = /^[0-9]+$/.test(username);
      let result = await Pdo.prepare(`
        select * from manager where ${withId ? 'id' : 'nickname'}=:username and code=SHA1(:password)
      `).execute({username,password});
      if(!result.rowCount){
          return Channel.message({code: code.AUTHENTICATION_ERROR});
      }
      let man = await new Manager().hydrate(result.fetch());
      if(!man.active){
          return Channel.message({code: code.DENIED_ACCESS});
      }
       await man.setOnline().setSession();
       return Channel.message({
           error: false,
           message: "Success",
           data: await man.data(true, true)
       });
    }

    static async dataExist(column, value, uid = null){
        const granted = ['mail', 'nickname', 'phone'];
        if(granted.indexOf(column) < 0) return false;
        try{
            const req = await Pdo.prepare(`
                select * from manager 
                where ${column}=:value
                ${uid ? 'and id != :uid': ''}
            `)
                .execute({value, ...(uid ? {uid} : {})})
            return req.rowCount > 0;
        }catch(e){
            Channel.logError(e);
            return false;
        }
    }

    static async emailExist(email, uid=null){
        return await Manager.dataExist('mail',email,uid);
    }

    static async nicknameExist(nickname,uid=null){
        return await Manager.dataExist('nickname',nickname,uid);
    }

    static async filter(branch, avoid = [], onlyData = true){
        const list = [];
        for(let i in Manager.list){
            if(
                branch in Manager.list[i].branches &&
                avoid.indexOf(Manager.list[i].id) < 0 &&
                Manager.list[i].createdBy
            ){
                list.push(onlyData ? await Manager.list[i].data() : Manager.list[i]);
            }
        }
        console.log('[Man][items]',list.length, '/', Manager.list.length)
        return list;
    }
}

module.exports = Manager;