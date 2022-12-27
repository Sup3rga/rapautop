let list = [
    'Data','Articles','Branch','Manager','Category'
],
modules = {};
for(let i in list) {
    module.exports[list[i]] = require('./'+list[i]);
}