let list = [
    'Data','Articles','Branch','Manager','Category','TracableData',
    'Pictures', 'Punchlines', 'Messenging', 'Subscriber',
    'Mailing', 'MailingReply'
],
modules = {};
for(let i in list) {
    module.exports[list[i]] = require('./'+list[i]);
}