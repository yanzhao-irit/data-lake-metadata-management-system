var pg = require('pg');
const pgInfo = require('@wmfs/pg-info');
const { extractSchema } = require('extract-pg-schema');

/*var _ = require('lodash');
const fs = require('fs');
const path = require('path');
let infoPostgres = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../store-PostgreSQL.json')));

var conString = "tcp://"+infoPostgres.username+":"+infoPostgres.password+"@localhost/test"; //tcp://username：password@localhost/dbname*/
var conString = "tcp://postgres:1111@localhost/test"; //tcp://username：password@localhost/dbname
var postgre =  new pg.Client(conString);



module.exports.openConnection =async () => {
    postgre.connect(function (error, results) {
        if (error) {
            postgre.end();
            return 'clientConnectionReady Error:' + error.message;
        }
        return 'connection success...';
    });
    const info = await pgInfo({
        client: postgre,
        schemas: [
            'public'
            // ,'zzz'
        ]
    });
    postgre.end();
    // console.log(info)
    return info;
}

module.exports.getTables = async () =>{
    const connection = {
        host: 'localhost',
        database: 'test',
        user: 'postgres',
        password: '1111',
    };

    const { tables } = await extractSchema('public', connection);

    console.log('Tables:');
    console.log(tables);
    return tables;
}

//example pour faire des query
var selectSQLString = 'select * from address';
module.exports.testQuery =async () => {
    postgre.connect(function (error, results) {
        if (error) {
            console.log('clientConnectionReady Error:' + error.message);
            postgre.end();
            return;
        }
        console.log('connection success...\n');
        postgre.query(selectSQLString, function (error, results) {
            return [error, results];
        })
    });
    postgre.end();
}
