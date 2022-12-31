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
    static async getById(){}
    static async getLast(){}
    static async fetchAll(){}
}

module.exports = Data;