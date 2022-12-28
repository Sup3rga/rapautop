let mysql = require('mysql'),
    Channel = require('./Channel');

class Connect{
   static object = null;
   static initialized = false;
   static init(){
       Connect.object = mysql.createConnection({
           host: 'localhost',
           user: 'root',
           password: '',
           database: 'museautop'
       });
       try{
           Connect.object.connect();
       }catch (e){
           console.log('[Connection] [ERR]', e);
           return false;
       }
       return true;
   }

   static query(sql,options=[],autoCatch=false){
       if(!Connect.initialized) {
           if(Connect.init()) {
               Connect.initialized = true;
           }
       }
       return new Promise((res,rej)=>{
           Connect.object.query(sql, options, (err,results,fields)=>{
               if(err && !autoCatch) {
                   return rej(err);
               }
               else if(err){
                   Channel.logError(err);
               }
               res(results);
           });
       })
   }

   static close(){
       Connect.close();
   }
}


module.exports = {Connect,Channel}