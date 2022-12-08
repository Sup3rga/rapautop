let express = require('express'),
    cors = require('cors'),
    server = express(),
    bodyParser = require('body-parser'),
    Manager = require('./data/Manager');

const PORT = process.env.PORT || 7070;

server.use(bodyParser.urlencoded({extended: true}))
server.use(bodyParser.raw())
server.use(bodyParser.json())
server.use(cors())

server
.post('/connect', (req,res)=>{
    let {identifier,code} = req.body;
    Manager
    .connect(identifier, code)
    .then((result)=>{
        res.json(result);
    });
});

server.listen(PORT);