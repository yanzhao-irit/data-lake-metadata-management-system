var pg = require('pg');
const pgInfo = require('@wmfs/pg-info');
const { extractSchema } = require('extract-pg-schema');

/*var _ = require('lodash');
const fs = require('fs');
const path = require('path');
let infoPostgres = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../store-PostgreSQL.json')));

var conString = "tcp://"+infoPostgres.username+":"+infoPostgres.password+"@localhost/test"; //tcp://username：password@localhost/dbname*/
const conString = "tcp://postgres:1111@localhost/test"; //tcp://username：password@localhost/dbname
const postgre =  new pg.Client(conString);


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
            ,'zzz'
        ]
    });
    // console.log(info.schemas)
    return info;
}

/*module.exports.getTables = async () =>{
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
}*/

//example for querys

module.exports.getInfoTable =(tableName) => {
    var selectSQLString = 'select * from '+tableName+';'
    return postgre.query(selectSQLString);
}
