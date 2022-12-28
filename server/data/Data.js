class Data{
    constructor() {
        this.createdAt = null;
        this.createdBy = 0;
    }
    async save(){}
    async delete(){}
    hydrate(data){
        return this;
    }
    static getById(){}
    static _getById(){}
    static getLast(){}
    static fetchAll(){}
}

module.exports = Data;