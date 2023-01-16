let Storage = require('../utils/Connect'),
    Channel = require('../utils/Channel'),
    Data = require('./Data');

class Branch extends Data{
    constructor() {
        super();
        this.id = 0;
        this.domain = null;
        this.createdAt = null;
        this.saved = false;
    }

    save(){

    }

}

module.exports = Branch;