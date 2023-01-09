let list = [
    'Data','Articles','Branch','Manager','Category','TracableData',
    'Pictures', 'Punchlines'
],
modules = {};
for(let i in list) {
    module.exports[list[i]] = require('./'+list[i]);
}