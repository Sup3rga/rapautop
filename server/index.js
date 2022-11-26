let express = require('express'),
    server = express(),
    fs = require('fs');
const PORT = process.env.PORT || 7070;

server.use('/res',express.static('assets'))
server.use('/lib',express.static('lib'))
server.use('/script',express.static('js'))


server.listen(PORT);