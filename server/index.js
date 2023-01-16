const fs = require("fs");
global.DIR = {
    ROOT: fs.realpathSync('../'),
    PUBLIC : fs.realpathSync('../public')
};
let express = require('express'),
    cors = require('cors'),
    server = express(),
    httpServer = require('http').createServer(server),
    {Server} = require('socket.io'),
    AKAD = require('./utils/AkaDatetime'),
    bodyParser = require('body-parser'),
    {Manager, Pictures, Articles} = require('./data/dataPackage'),
    ThunderSpeed = require('./utils/thunderspeed.server'),
    {manage,serve} = require('./controller/socketManagement'),
    Filter = require('./utils/Filter');

const PORT = /*process.env.PORT ||*/ 7070;

const io = new Server(httpServer, {
    cors:{
        origin: 'http://localhost:3000',
        methods: ["GET","POST"]
    }
});

const ths = new ThunderSpeed();
ths.setResumable(true);
ThunderSpeed.uploadDir = fs.realpathSync('./ths_tmp');
ThunderSpeed.baseDir = fs.realpathSync('./');

let requestConfig = {
    limit: '10mb'
}

server.use(cors())
server.use(bodyParser.json(requestConfig))
server.use(bodyParser.raw(requestConfig))
server.use(ths.watch(['artimg','upl_pch','mailimg','upl_avt']))

io.on("connection", (socket)=>manage(socket));

server
.post('/submit', (request,response)=> serve(request.body,response,ths))
.post('/fetch', (request,response)=> serve(request.body,response,ths))
.post('/connect', (request,response)=> serve(request.body,response,ths))
.post('/upl_img', (request, response)=> serve(request.body,response,ths))

httpServer.listen(PORT);