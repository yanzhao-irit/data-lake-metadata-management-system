console.log("test")
var pg = require('pg');

/*var _ = require('lodash');
const fs = require('fs');
const path = require('path');
let infoPostgres = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../store-PostgreSQL.json')));

var conString = "tcp://"+infoPostgres.username+":"+infoPostgres.password+"@localhost/test"; //tcp://username：password@localhost/dbname*/
var conString = "tcp://postgres:1111@localhost/test"; //tcp://username：password@localhost/dbname
var client =  new pg.Client(conString);


var selectSQLString = 'select * from actor';
window.onload = test();
function test(){
    client.connect(function(error, results){
        if (error) {
            console.log('clientConnectionReady Error:'+error.message);
            client.end();
            return;
        }
        console.log('connection success...\n');
        console.log(client.metadata)
        client.query(selectSQLString,function(error,results){
            console.log(results);
            console.log(error);
        })
    });
}
