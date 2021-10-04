const api = require("../neo4jApi");
const _ = require('lodash');
process.env.ORA_SDTZ = 'UTC';

const oracledb = require('oracledb');
//const dbConfig = require('./dbconfig.js');


$("#dialog").dialog();

if (process.platform === 'win32') { // Windows
    oracledb.initOracleClient({ libDir: 'C:\\instantclient_19_11' });
} else if (process.platform === 'darwin') { // macOS
    console.log('ios')
    oracledb.initOracleClient({ libDir: process.env.HOME + '/Downloads/instantclient_19_8' });
}



document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('add').addEventListener("click", addTag);
    document.getElementById("zone0").addEventListener("input", printTags);
    document.getElementById('reloadUpload').addEventListener('click', reload);
    // document.getElementById('user').addEventListener("keyup", getUser);
    // document.getElementById("pwd").addEventListener("input", getPwd);
    // document.getElementById('host').addEventListener('change', getHost);
    document.getElementById('try').addEventListener('click',tryConnection);
    document.getElementById('add').addEventListener("click", addTag);
    document.getElementById('confirmBtn').addEventListener('click', ingestNeo4j);
});

//some variable used in all function
var NumberTags = 0;
var tags_Structured = [];
var nodesDatasetSource = []
var nodesDataSetDataLake = []
var nodesEntityCLass = []
var nodesAttributes = []
var t1;
var t2;
var tTotal;

async function ingestNeo4j() {
    document.getElementById("waitingBox").style.display = "block";
    document.getElementById("confirmSendBox").style.display = "none";
    setTags()
    getMetadata()
}

async function tryConnection() {

    let connection;
    try {
        console.log('before connection')
        pool = await oracledb.createPool({
            user: process.env.NODE_ORACLEDB_USER || document.getElementById('user').value,
            password: process.env.NODE_ORACLEDB_PASSWORD || document.getElementById("pwd").value,
            connectString: process.env.NODE_ORACLEDB_CONNECTIONSTRING || "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=" + document.getElementById("host").value + ")(PORT=" + document.getElementById("port").value + "))(CONNECT_DATA=(SERVER=DEDICATED)(SID=" + document.getElementById("sid").value + ")))",
            externalAuth: process.env.NODE_ORACLEDB_EXTERNALAUTH ? true : false
        });
        connection = await pool.getConnection()
        console.log('after connection')
        document.getElementById("resultConnection").innerText = 'connection succeeded';
        console.log(connection)
    }catch (err) {
        console.error(err);
        document.getElementById("resultConnection").innerText = 'Please check if the information you entered is correct'
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

//When the insert into Neo4j is finished, reload this page
function reload() {
    location.reload();
}

async function getMetadata() {
    t1 = Date.now()
    let connection;
    try {

        let sql, binds, options, result;
        console.log('before connection')
        pool = await oracledb.createPool({
            user: process.env.NODE_ORACLEDB_USER || document.getElementById('user').value,
            password: process.env.NODE_ORACLEDB_PASSWORD || document.getElementById("pwd").value,
            connectString: process.env.NODE_ORACLEDB_CONNECTIONSTRING || "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=" + document.getElementById("host").value + ")(PORT=" + document.getElementById("port").value + "))(CONNECT_DATA=(SERVER=DEDICATED)(SID=" + document.getElementById("sid").value + ")))",
            externalAuth: process.env.NODE_ORACLEDB_EXTERNALAUTH ? true : false
        });
        connection = await pool.getConnection()
        console.log('after connection')
        console.log(connection)
        //
        // Create a table
        //

        var stmts = [
            `SELECT OWNER FROM DBA_OBJECTS WHERE DBA_OBJECTS.OWNER NOT IN ('ORACLE_OCM','HR','SYS','PUBLIC','SYSTEM','CTXSYS','DVSYS','DVF','GSMADMIN_INTERNAL','ORDPLUGINS','ORDDATA','MDSYS','OLAPSYS','LBACSYS','XDB','WMSYS','ORDSYS','AUDSYS') AND ORACLE_MAINTAINED = 'N' GROUP BY OWNER HAVING COUNT(*) != 0`
        ];

        for (const s of stmts) {
            try {
                result_dataSource = await connection.execute(s);
            } catch (e) {
                if (e.errorNum != 942)
                    console.error(e);
            }
        }
        console.log('Schema / Users')
        console.dir(result_dataSource.rows[0])



        stmts = [
            `SELECT OWNER,OBJECT_NAME FROM DBA_OBJECTS WHERE DBA_OBJECTS.OWNER NOT IN ('HR','SYS','PUBLIC','SYSTEM','CTXSYS','DVSYS','DVF','GSMADMIN_INTERNAL','ORDPLUGINS','ORDDATA','MDSYS','OLAPSYS','LBACSYS','XDB','WMSYS','ORDSYS','AUDSYS') AND DBA_OBJECTS.OBJECT_TYPE = 'TABLE' AND ORACLE_MAINTAINED = 'N'`
        ];

        for (const s of stmts) {
            try {
                result_EC = await connection.execute(s);
            } catch (e) {
                if (e.errorNum != 942)
                    console.error(e);
            }
        }
        console.log('Entity Class')
        console.dir(result_EC.rows)
        var result_count = [];
        for(var i =0; i<result_EC.rows.length; i++){
            stmts = [`SELECT COUNT(*) FROM `+ result_EC.rows[i][0]+`.`+result_EC.rows[i][1]]
            for (const s of stmts) {
                try {
                    result_count.push(await connection.execute(s));
                } catch (e) {
                    if (e.errorNum != 942)
                        console.error(e);
                }
            }
        }

        stmts = [
            `SELECT * FROM DBA_TAB_COLUMNS WHERE DBA_TAB_COLUMNS.OWNER NOT IN ('OJVMSYS','DBSFWUSER','HR','OUTLN','APPQOSSYS','DBSNMP','SYS','PUBLIC','SYSTEM','CTXSYS','DVSYS','DVF','GSMADMIN_INTERNAL','ORDPLUGINS','ORDDATA','MDSYS','OLAPSYS','LBACSYS','XDB','WMSYS','ORDSYS','AUDSYS')`
        ];

        for (const s of stmts) {
            try {
                result_attribut = await connection.execute(s);
            } catch (e) {
                if (e.errorNum != 942)
                    console.error(e);
            }
        }
        console.log('Attribut')
        console.dir(result_attribut.rows)

        stmts = [`SELECT OWNER,TABLE_NAME,COUNT(COLUMN_NAME) AS nb_attribute FROM DBA_TAB_COLUMNS WHERE DBA_TAB_COLUMNS.OWNER NOT IN ('DBSFWUSER','OUTLN','OJVMSYS','APPQOSSYS','DBSNMP','HR','SYS','PUBLIC','SYSTEM','CTXSYS','DVSYS','DVF','GSMADMIN_INTERNAL','ORDPLUGINS','ORDDATA','MDSYS','OLAPSYS','LBACSYS','XDB','WMSYS','ORDSYS','AUDSYS') GROUP BY OWNER,TABLE_NAME`]
        for (const s of stmts) {
            try {
                result_nbAttribute = await connection.execute(s);
            } catch (e) {
                if (e.errorNum != 942)
                    console.error(e);
            }
        }
        console.log('Attribut')
        console.log(result_nbAttribute)
        console.dir(result_nbAttribute.rows)

        stmts = [
            `select round((sum(bytes)/1024/1024/1024),2) from v$datafile`
        ];

        for (const s of stmts) {
            try {
                result_size = await connection.execute(s);
            } catch (e) {
                if (e.errorNum != 942)
                    console.error(e);
            }
        }
        console.log('Taille de la base en Gb')
        console.dir(result_size.rows)


        nodesDatasetSource.push({ 'name': document.getElementById('DBName').value, 'owner': document.getElementById('owner').value, 'type': 'structured dataset', 'size': result_size.rows[0][0] + ' Go' , 'description': document.getElementById('descripetionO').value })
        for (var i = 0; i < result_dataSource.rows.length; i++) {
            nodesDataSetDataLake.push({ 'name': result_dataSource.rows[i][0] })
        }
        for (var i = 0; i < result_nbAttribute.rows.length; i++) {
            nodesEntityCLass.push([result_nbAttribute.rows[i][0], { 'name': result_nbAttribute.rows[i][1], 'numberOfAttributes': result_nbAttribute.rows[i][2] }])

        }
        for (var i = 0; i < result_attribut.rows.length; i++) {
            if(result_attribut.rows[i][3]=="NUMBER"){
                nodesAttributes.push([result_attribut.rows[i][1], { 'name': result_attribut.rows[i][2], 'type': 'Numeric', 'min': result_attribut.rows[i][14],'max': result_attribut.rows[i][15],'missingValue': result_attribut.rows[i][17] }])
            }else{
                nodesAttributes.push([result_attribut.rows[i][1], { 'name': result_attribut.rows[i][2], 'type': result_attribut.rows[i][3] }])
            }
        }

        console.log(nodesDatasetSource)
        console.log(nodesDataSetDataLake)
        console.log(nodesEntityCLass)
        console.log(nodesAttributes)
        console.log(tags_Structured)



        api.
        ingestFromOracle(nodesDatasetSource, nodesDataSetDataLake, nodesEntityCLass, nodesAttributes, tags_Structured)



    } catch (err) {
        console.error(err);
    } finally {

        t2 = Date.now()
        console.log(t1)
        console.log(t2)
        console.log(t2 - t1 + 'ms')
        tTotal = t2 - t1;
        document.getElementById("resultInsert").innerText="Completed, it took "+tTotal +" ms"
        document.getElementById("reload").style.display="block"
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
}

//show tags in dropdown menu
function printTags() {
    var zone = "zone" + NumberTags;
    var zoneaff = "zoneaff" + NumberTags;
    var lien = "lien" + NumberTags;
    var elt2 = document.getElementById(zoneaff);
    elt2.innerText = "";
    //To receive result of BD
    var length = 0;
    var tag = document.getElementById(zone).value;
    api.getTags(tag).then(p => {
        length = p.length;
        for (x = 0; x < length; x++) {
            elt2.insertAdjacentHTML('beforeend', "<li><a name='" + lien + "'>" + p[x].name + "</a></li>");
        }
        var elt3 = document.getElementsByName(lien);
        for (j = 0; j < elt3.length; j++) {
            elt3[j].addEventListener("click", changerInputText);
        }
    })
}

//When click a tag, input text change
function changerInputText() {
    var zone = "zone" + NumberTags;
    var zoneaff = "zoneaff" + NumberTags;
    document.getElementById(zone).value = this.innerText;
    document.getElementById(zoneaff).style.display = "none";
}

//When click "+", create new zone of input text
function addTag() {
    console.log('why')
    var elt = document.getElementById('Tags');
    NumberTags = NumberTags + 1;
    elt.insertAdjacentHTML("beforeend", "<div class='dropdown'><label for='zone" + NumberTags + "'>Tag " + (NumberTags + 1) + ": </label>" +
        "<input name='tagsUsers' type='text' id='zone" + NumberTags + "' data-toggle='dropdown' required>" +
        "<ul class='dropdown-menu' id='zoneaff" + NumberTags + "' style='margin-left:33%;height:100px;width:270px;overflow:scroll;'></ul></div>");
    var zone = "zone" + NumberTags;
    console.log(document.getElementById(zone));
    document.getElementById(zone).addEventListener("input", printTags);
}

//set tags from the page html
function setTags() {
    tags_Structured = [];
    var lengthTags = document.getElementsByName("tagsUsers").length;
    for (i = 0; i < lengthTags; i++) {
        var tag = {};
        tag["name"] = document.getElementsByName("tagsUsers")[i].value;
        tags_Structured.push(tag);
    }
}



