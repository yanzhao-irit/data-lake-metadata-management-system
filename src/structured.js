process.env.ORA_SDTZ = 'UTC';

const oracledb = require('oracledb');
//const dbConfig = require('./dbconfig.js');
const api = require("../neo4jApi");
const _ = require('lodash')


$( "#dialog" ).dialog();

if (process.platform === 'win32') { // Windows
    oracledb.initOracleClient({ libDir: 'C:\\Program Files\\Oracle\\instantclient_19_11' });
} else if (process.platform === 'darwin') { // macOS
    console.log('ios')
    oracledb.initOracleClient({ libDir: process.env.HOME + '/Downloads/instantclient_19_8' });
}

document.addEventListener("DOMContentLoaded", () => {
    // document.getElementById('user').addEventListener("keyup", getUser);
    // document.getElementById("pwd").addEventListener("input", getPwd);
    // document.getElementById('host').addEventListener('change', getHost);
    // document.getElementById('port').addEventListener('click',getPort);
    document.getElementById('submitInfo').addEventListener('click',ingestNeo4j);
  });

var nodesDatasetSource = []
var nodesIngest = []
var nodesDataSetDataLake = []
var nodesEntityCLass = []
var nodesAttributes = []
var relationship = []

async function ingestNeo4j() {
    getMetadata()

}



async function getMetadata() {
    let connection;
    try {

        let sql, binds, options, result;
        console.log('before connection')
        pool = await oracledb.createPool({
            user          : process.env.NODE_ORACLEDB_USER || document.getElementById('user').value,
            password      : process.env.NODE_ORACLEDB_PASSWORD || document.getElementById("pwd").value,
            connectString : process.env.NODE_ORACLEDB_CONNECTIONSTRING || "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST="+document.getElementById("host").value+")(PORT="+document.getElementById("port").value+"))(CONNECT_DATA=(SERVER=DEDICATED)(SID="+document.getElementById("sid").value+")))",
            externalAuth  : process.env.NODE_ORACLEDB_EXTERNALAUTH ? true : false
          });
        connection = await pool.getConnection()
        console.log('after connection')
        console.log(connection)
        //
        // Create a table
        //

        var stmts = [
            `SELECT OWNER FROM ALL_OBJECTS WHERE ALL_OBJECTS.OWNER NOT IN ('SYS','PUBLIC','SYSTEM','CTXSYS','DVSYS','DVF','GSMADMIN_INTERNAL','ORDPLUGINS','ORDDATA','MDSYS','OLAPSYS','LBACSYS','XDB','WMSYS','ORDSYS','AUDSYS') AND ORACLE_MAINTAINED = 'N' GROUP BY OWNER HAVING COUNT(*) != 0`
            ];

        for (const s of stmts) {
            try {
                result_dataSource  = await connection.execute(s);
            } catch (e) {
                if (e.errorNum != 942)
                    console.error(e);
            }
        }
        console.log('Schema / Users')
        console.dir(result_dataSource.rows[0])
        
        stmts = [
            `SELECT OWNER,OBJECT_NAME FROM ALL_OBJECTS WHERE ALL_OBJECTS.OWNER NOT IN ('SYS','PUBLIC','SYSTEM','CTXSYS','DVSYS','DVF','GSMADMIN_INTERNAL','ORDPLUGINS','ORDDATA','MDSYS','OLAPSYS','LBACSYS','XDB','WMSYS','ORDSYS','AUDSYS') AND ALL_OBJECTS.OBJECT_TYPE = 'TABLE' AND ORACLE_MAINTAINED = 'N'`
        ];

        for (const s of stmts) {
            try {
                result_EC  = await connection.execute(s);
            } catch (e) {
                if (e.errorNum != 942)
                    console.error(e);
            }
        }
        console.log('Entity Class')
        console.dir(result_EC.rows)


        stmts = [
            `SELECT OWNER,TABLE_NAME,COLUMN_NAME,DATA_TYPE FROM ALL_TAB_COLUMNS WHERE ALL_TAB_COLUMNS.OWNER NOT IN ('SYS','PUBLIC','SYSTEM','CTXSYS','DVSYS','DVF','GSMADMIN_INTERNAL','ORDPLUGINS','ORDDATA','MDSYS','OLAPSYS','LBACSYS','XDB','WMSYS','ORDSYS','AUDSYS')`
        ];

        for (const s of stmts) {
            try {
                result_attribut  = await connection.execute(s);
            } catch (e) {
                if (e.errorNum != 942)
                    console.error(e);
            }
        }
        console.log('Attribut')
        console.dir(result_attribut.rows)

        stmts = [`SELECT OWNER,TABLE_NAME,COUNT(COLUMN_NAME) AS nb_attribute FROM ALL_TAB_COLUMNS WHERE ALL_TAB_COLUMNS.OWNER NOT IN ('SYS','PUBLIC','SYSTEM','CTXSYS','DVSYS','DVF','GSMADMIN_INTERNAL','ORDPLUGINS','ORDDATA','MDSYS','OLAPSYS','LBACSYS','XDB','WMSYS','ORDSYS','AUDSYS') GROUP BY OWNER,TABLE_NAME`]
        for (const s of stmts) {
            try {
                result_nbAttribute  = await connection.execute(s);
            } catch (e) {
                if (e.errorNum != 942)
                    console.error(e);
            }
        }
        console.log('Attribut')
        console.dir(result_nbAttribute.rows)

        stmts = [
            `select round((sum(bytes)/1024/1024/1024),2) from v$datafile`
        ];

        for(const s of stmts){
            try {
                result_size = await connection.execute(s);
            } catch (e) {
                if (e.errorNum != 942)
                    console.error(e);
            }
        }
        console.log('Taille de la base en Gb')
        console.dir(result_size.rows)


        nodesDatasetSource.push({'name' : document.getElementById('DBName').value, 'owner' : document.getElementById('owner').value, 'type' : 'Relationnal Database Oracle', 'size' : result_size.rows[0][0] + ' Go'})
        for(var i = 0; i<result_dataSource.rows.length; i++){
            nodesDataSetDataLake.push({'name': result_dataSource.rows[i][0]})
        }
        for(var i = 0; i<result_nbAttribute.rows.length; i++){
                nodesEntityCLass.push([result_nbAttribute.rows[i][0],{'name' : result_nbAttribute.rows[i][1], 'numberOfAttributes' : result_nbAttribute.rows[i][2]}])
            
        }
        for(var i = 0; i<result_attribut.rows.length; i++){
            nodesAttributes.push([result_attribut.rows[i][1],{'name' : result_attribut.rows[i][2], 'type': result_attribut.rows[i][3]}])
        }

        console.log(nodesDatasetSource)
        console.log(nodesDataSetDataLake)
        console.log(nodesEntityCLass)
        console.log(nodesAttributes)

        api.
            ingestOracle(nodesDatasetSource,nodesDataSetDataLake,nodesEntityCLass,nodesAttributes)
        //
        // Insert three rows
        //

        // sql = `INSERT INTO no_example VALUES (:1, :2)`;

        // binds = [
        //     [101, "Alpha"],
        //     [102, "Beta"],
        //     [103, "Gamma"]
        // ];

        // // For a complete list of options see the documentation.
        // options = {
        //     autoCommit: true,
        //     // batchErrors: true,  // continue processing even if there are data errors
        //     bindDefs: [
        //         { type: oracledb.NUMBER },
        //         { type: oracledb.STRING, maxSize: 20 }
        //     ]
        // };
        // console.log('before result')
        // result = await connection.executeMany(sql, binds, options);
        // console.log('after result')
        // console.log("Number of rows inserted:", result.rowsAffected);

        // //
        // Query the data
        //

        sql = `SELECT * FROM no_example`;

        binds = {};

        // For a complete list of options see the documentation.
        options = {
            outFormat: oracledb.OUT_FORMAT_OBJECT,   // query result format
            extendedMetaData: true,               // get extra metadata
        };

        result = await connection.execute(sql, binds, options);

        console.log("Metadata: ");
        console.dir(result.metaData, { depth: null });
        console.log("Query results: ");
        console.dir(result.rows, { depth: null });

        //
        // Show the date.  The value of ORA_SDTZ affects the output
        //

        sql = `SELECT TO_CHAR(CURRENT_DATE, 'DD-Mon-YYYY HH24:MI') AS CD FROM DUAL`;
        result = await connection.execute(sql, binds, options);
        console.log("Current date query results: ");
        console.log(result.rows[0]['CD']);

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

//run()
