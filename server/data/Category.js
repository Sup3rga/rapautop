let {Connect} = require('../utils/Connect'),
    Channel = require('../utils/Channel'),
    Data = require('./Data');

class Category extends Data{

    static async fetchAll(branch,type = 'A'){
        let list = await Connect.query("select id, name from category where attached_to=? and branch=?",[
            type, branch
        ]),
        result = [];
        if(list.length){
            for(let i in list){
                result.push({
                    id: list[i].id,
                    name: list[i].name
                });
            }
        }
        return result;
    }
}

module.exports = Category;