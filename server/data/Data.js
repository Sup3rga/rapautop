class Data{
    constructor() {
        this.createdAt = null;
        this.createdBy = 0;
    }
    async save(){}
    async delete(){}
    async data(){}
    hydrate(data){
        return this;
    }
    static async getById(){}
    static async getLast(){}
    static async fetchAll(branch = 0, onlyData = true, _public = false){}
}

module.exports = Data;