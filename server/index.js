let express = require('express'),
    cors = require('cors'),
    server = express(),
    httpServer = require('http').createServer(server),
    {Server} = require('socket.io'),
    AKAD = require('./utils/AkaDatetime'),
    bodyParser = require('body-parser'),
    {Manager, Pictures, Articles} = require('./data/dataPackage'),
    ThunderSpeed = require('./utils/thunderspeed.server'),
    manage = require('./utils/socketManagement'),
    Filter = require('./utils/Filter');
const fs = require("fs");

const PORT = /*process.env.PORT ||*/ 7070;

const io = new Server(httpServer, {
    cors:{
        origin: 'http://localhost:3000',
        methods: ["GET","POST"]
    }
});

const ths = new ThunderSpeed();

ThunderSpeed.uploadDir = fs.realpathSync('./ths_tmp');
ThunderSpeed.baseDir = fs.realpathSync('./');

let requestConfig = {
    limit: '10mb'
}


server.use(cors())
server.use(bodyParser.json(requestConfig))
server.use(bodyParser.raw(requestConfig))
server.use(ths.watch(['artimg']))

io.on("connection", (socket)=>{
    manage(socket);
});

server
.post('/connect', (req,res)=>{
    let {identifier,code} = req.body;
    Manager
    .connect(identifier, code)
    .then((result)=>{
        res.json(result);
    });
})
.post('/upl_img', async (req, res)=>{
    // console.log('[Body]',req.body);
    let {upl_artimg} = Filter.object(req.body, ['upl_artimg']),
        image = '';
    for(let i in upl_artimg){
        if(ths.isUploaded(upl_artimg[i])){
            const dest = await Pictures.nextName('A') + '.' + Pictures.extension(upl_artimg[i]);
            image = '/assets/captions/'+dest;
            await ths.move(upl_artimg[i], '../public/assets/captions/', dest);
        }
    }
    res.json({
        filename: image
    })
})

httpServer.listen(PORT);