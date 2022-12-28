let {Connect,Channel} = require('../utils/Connect'),
    Filter = require('../utils/Filter'),
    code = require('../utils/ResponseCode'),
    TracableData = require('./TracableData');

class Category extends TracableData{

    static list = [];

    constructor() {
        super();
        this.name = null;
        this.id = 0;
        this.sector = null;
        console.log('[This]',this);
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
            try {
                await Connect.query(`
                    insert into category (name, attached_to, created_by, created_at, modified_at, modified_by, branch)
                    values (?, ?, ?, ?, ?, ?, ?)
                `, [
                    this.name, this.sector, this.createdBy, this.createdBy,
                    this.createdBy, this.createdBy, this.branch
                ]);
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
                this.name, this.modifiedBy, this.modifiedAt, this.id
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
        this.createdAt = data.created_at;
        this.createdBy = data.created_by;
        this.modifiedBy = data.modified_by;
        this.modifiedAt = data.modified_at;
        this.branch = data.branch;
        return this;
    }

    data(){
        return Filter.object(this, [
            'id', 'name', 'createdBy','createdAt',
            'modifiedAt','modifiedBy', 'branch',
            'sector'
        ]);
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

    static async fetchAll(branch,type = 'A'){
        let  result = [];
        try {
            let list = await Connect.query("select * from category where attached_to=? and branch=?", [
                type, branch
            ]);
            if (list.length) {
                for (let i in list) {
                    result.push(new Category().hydrate(data).data());
                }
            }
        }catch(e){
            Channel.logError(e);
        }
        return result;
    }
}

module.exports = Category;