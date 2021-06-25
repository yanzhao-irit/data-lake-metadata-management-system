console.log("test")
const api = require("../postgreApi");

var DatasetSource_postgre = {};
var DSDatalake_postgre = {};
var Ingest_postgre = {};
var EntityClass_postgre = [];



testApi2()
function testApi2(){
    api.openConnection().then(p =>{
        console.log(p.schemas.public.tables);
        var tables = Object.entries(p.schemas.public.tables)
        // console.log(tables)
        for (var i=0; i<tables.length;i++ ){
            var Entityclass ={}
            Entityclass['name'] = tables[i][0]
            Entityclass['comment'] = tables[i][0].comment
            var columns = Object.entries(tables[i][1].columns)
            // console.log(columns)
            var attributs = []
            for (var j=0; j<columns.length;j++ ){

                if(columns[j][1].dataType==="Integer"){
                    var numericAttribute = {}
                    numericAttribute['name'] = columns[j][0]
                    numericAttribute['type'] = columns[j][1].dataType
                    attributs.push(numericAttribute)
                }else{
                    var nominalAttribute = {}
                    nominalAttribute['name'] = columns[j][0]
                    nominalAttribute['type'] = columns[j][1].dataType
                    attributs.push(nominalAttribute)
                }
            }
            Entityclass['attributes'] = attributs
            EntityClass_postgre.push(Entityclass)
        }

    })
    console.log(EntityClass_postgre)
}




/*function testApi(){
    api.getTables().then(p =>{
        console.log(p);
    })
}*/

/*
const oracledb = require('oracledb');

// oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;


async function run() {

    let connection;

    try {
        connection = await oracledb.getConnection( {
            user          : "xe",
            password      : "Oracle1111",
            connectString : "localhost/XEPDB1"
        });

        const result = await connection.execute(
            `SELECT sysdate FROM dual`,
        );
        console.log(result);

    } catch (err) {
        console.error(err);
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
}

run();*/
