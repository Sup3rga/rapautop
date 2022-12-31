const fs = require("fs");
const {promisify} = require('util')

function isset(val){
    return typeof val !== 'undefined';
}

function empty(val){
    return val === '' || val == null;
}

function time(){
    return new Date().getTime();
}

function is_array(val){
    return Array.isArray(val);
}

function filter(list, val){
    const _list = [];
    for(let i in list){
        if(list[i] != val){
            _list.push(list[i]);
        }
    }
    return _list;
}

function base64_decode(base64){
    return buffer_base64(base64).toString('binary');
}

function buffer_base64(base64){
    return  Buffer.from(base64, 'base64');
}

async function is_file(filename){
    let exist = await promisify(fs.exists)(filename);
    if(exist){
        let status = await promisify(fs.stat)(filename);
        return status.isFile();
    }
    return false;
}

async function rename(filename, name){
    await promisify(fs.rename)(filename, name);
}

async function unlink(filename){
    if(await is_file(filename)){
        await promisify(fs.unlink)(filename);
    }
}

module.exports = {
    isset,empty,time,is_array,base64_decode,
    is_file,rename,unlink,buffer_base64,
    filter
};