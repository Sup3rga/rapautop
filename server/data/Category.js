let {Connect,Channel, Pdo} = require('../utils/Connect'),
    Filter = require('../utils/Filter'),
    code = require('../utils/ResponseCode'),
    AkaDatetime = require('../utils/AkaDatetime'),
    Manager = require('./Manager'),
    TracableData = require('./TracableData');

class Category extends TracableData{

    static list = [];

    constructor() {
        super();
        this.name = null;
        this.id = 0;
        this.sector = null;
    }

    async save(){
        if(!Filter.contains(this, [
            'name', 'sector', 'createdAt','createdBy', 'branch'
        ], [null,0])){
            return Channel.message({
                code: code.INVALID
            });
        }
        if(this.id && !Filter.contains(this, ['modifiedBy', 'modifiedAt'], [null,0])){
            return Channel.message({code: code.INVALID});
        }
        if(!this.id){
            try{
                let db = await Pdo.prepare(`
                    insert into category (name, attached_to, created_by, created_at, modified_by, modified_at, branch)
                    values (:p1, :p2, :p3, :p4, :p3, :p4, :p5)
                `).execute({
                    p1: this.name,
                    p2: this.sector,
                    p3: this.createdBy,
                    p4:  new AkaDatetime(this.createdAt).getDateTime(),
                    p5: this.branch
                });
            }catch(e){
                Channel.logError(e);
                return Channel.message({code: code.INTERNAL});
            }
            return Channel.message({error: false, code: code.SUCCESS});
        }
        try{
            await Connect.query(`
                update category set name = ?, modified_by = ?, modified_at = ?
                where id = ?
            `, [
                this.name, this.modifiedBy, new AkaDatetime(this.modifiedAt).getDateTime(),
                this.id
            ]);
        }catch(e){
            Channel.logError(e);
            return Channel.message({code: code.INTERNAL});
        }
        return Channel.message({error: false, code: code.SUCCESS});
    }

    hydrate(data) {
        this.id = data.id;
        this.name = data.name;
        this.sector = data.attached_to;
        this.createdAt = new AkaDatetime(data.created_at).getDateTime();
        this.createdBy = data.created_by;
        this.modifiedBy = data.modified_by;
        this.modifiedAt = new AkaDatetime(data.modified_at).getDateTime();
        this.branch = data.branch;
        return this;
    }

    async data(){
        const data = Filter.object(this, [
            'id', 'name', 'createdBy','createdAt',
            'modifiedAt','modifiedBy', 'branch',
            'sector'
        ]);
        data.createdBy = await (await Manager.getById(data.createdBy)).data(true, false, true);
        data.modifiedBy = await (await Manager.getById(data.modifiedBy)).data(true, false, true);
        return data;
    }

    async delete(){
        if(!this.id){
            return Channel.message({code: code.INVALID});
        }
        try{
            await Connect.query(`
                delete from category where id = ?   
            `, [this.id]);
        }catch(e){
            return Channel.logError(e).message({code: code.INVALID});
        }
        return Channel.message({error: false, code: code.SUCCESS});
    }

    static async fetchAll(branch,type = 'A', dataOnly = true){
        let  result = [];
        try {
            let req = await Pdo.prepare("select * from category where attached_to=:p1 and branch=:p2")
                                .execute({
                                    p1: type,
                                    p2: branch
                                });
            if (req.rowCount) {
                let data,res;
                while(data = req.fetch()) {
                    res = new Category().hydrate(data);
                    if(dataOnly){
                        res = await res.data();
                    }
                    result.push(res);
                }
            }
        }catch(e){
            Channel.logError(e);
        }
        return result;
    }

    static async getById(id){
        let category = null;
        try {
            let request = await Pdo.prepare("select * from category where id=:id")
                                    .execute({id});
            console.log('[count]',request.rowCount);
            if(request.rowCount){
                category = new Category().hydrate(request.fetch());
            }
        }catch(e){
            Channel.logError(e);
        }
        return category;
    }
}

module.exports = Category;