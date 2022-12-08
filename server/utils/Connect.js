let mysql = require('mysql'),
    Channel = require('./Channel');

class Connect{
   static object = null;
   static init(){
       Connect.object = mysql.createConnection({
           host: 'localhost',
           user: 'root',
           password: '',
           database: 'museautop'
       });
       Connect.object.connect();
   }

   static query(sql,options=[],autoCatch=false){
       Connect.init();
       return new Promise((res,rej)=>{
           Connect.object.query(sql, options, (err,results,fields)=>{
               if(err && !autoCatch) {
                   console.log('[Err]',err);
                   return rej(err);
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