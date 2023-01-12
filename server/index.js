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
    manage = require('./controller/socketManagement'),
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
server.use(ths.watch(['artimg','upl_pch']))

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
    let {
        upl_artimg = [],
        pch_img = []
    } = req.body,
        image = '';
    for(let i in upl_artimg){
        if(await ths.isUploaded(upl_artimg[i])){
            if(await ths.isUploaded(upl_artimg[i])) {
                const dest = await Pictures.nextName('A') + '.' + Pictures.extension(upl_artimg[i]);
                image = '/assets/captions/' + dest;
                await ths.move(upl_artimg[i], '../public/assets/captions/', dest);
            }
        }
    }
    if(pch_img.length){
        image = [];
    }
    for(let i in pch_img){
        if(await ths.isUploaded(pch_img[i])){
            const dest = await Pictures.nextName('P') + '.' + Pictures.extension(pch_img[i]);
            image.push('/assets/captions/'+dest);
            await ths.move(pch_img[i], '../public/assets/captions/', dest);
        }
    }
    res.json({
        filename: image
    })
})

httpServer.listen(PORT);