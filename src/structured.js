/*console.log("test")
const api = require("../postgreApi");*/

var pg = require('pg');
const pgInfo = require('@wmfs/pg-info');

const apineo4j = require("../neo4jApi");
const _ = require('lodash');

//some variable used in all function
var today = new Date();
var NumberTags = 0;
var tags_Structured = [];
var DatasetSource_postgre = {};
var DSDatalake_postgre = {};
var Ingest_postgre = {};

var metaPostgre = {};
var conString = ""; //tcp://username：password@localhost/dbname
var postgre = "";
var info = "";
var schemasname =[];
var schemas =[];

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('chosedb').addEventListener("click", dbConfirm);
    document.getElementById('add').addEventListener("click", addTag);
    document.getElementById("zone0").addEventListener("input", printTags);
    document.getElementById('connectionPostgresql').addEventListener('click',getSchemasPostgre);
    document.getElementById('submitPostgres').addEventListener('click',setAllMetadatas);
    document.getElementById('confirmBtn').addEventListener('click',confirmInsert);
    document.getElementById('reloadUpload').addEventListener('click',reload);
});

function dbConfirm(){
    document.getElementById("databaseChose").style.display="none";
    if(document.getElementById("dbOption").value === "postgresql"){
        document.getElementById("postgresqlOption").style.display="block";
    }else{
        document.getElementById("oracleOption").style.display="block";
    }
}

//show tags in dropdown menu
function printTags() {
    var zone = "zone" + NumberTags;
    var zoneaff = "zoneaff" + NumberTags;
    var lien = "lien" + NumberTags;
    var elt2 = document.getElementById(zoneaff);
    elt2.innerText="";
    //To receive result of BD
    var length = 0;
    var tag = document.getElementById(zone).value;
    apineo4j.getTags(tag).then(p => {
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
    var elt = document.getElementById('Tags');
    NumberTags = NumberTags + 1;
    elt.insertAdjacentHTML("beforeend", "<div class='dropdown'><label for='zone" + NumberTags + "'>Tag "+(NumberTags+1) +": </label>" +
        "<input name='tagsUsers' type='text' id='zone" + NumberTags + "' data-toggle='dropdown' required>" +
        "<ul class='dropdown-menu' id='zoneaff" + NumberTags + "' style='margin-left:33%;height:100px;width:270px;overflow:scroll;'></ul></div>");
    var zone = "zone" + NumberTags;
    console.log(document.getElementById(zone));
    document.getElementById(zone).addEventListener("input", printTags);
}

//set the owner and location of dataset form the html page
function setDatasetSource_postgres(){
    DatasetSource_postgre["owner"] = document.getElementById("ownerPostgres").value;
    DatasetSource_postgre["location"] = document.getElementById("serveurPostgres").value;
    DatasetSource_postgre["name"] = document.getElementById("dbnamePostgres").value;
    DatasetSource_postgre["type"] = "Structured dataset";
}

//set the ingest start time and end time form the html page
function setIngest_postgres(){
    Ingest_postgre["ingestionMode"] = "batch";
    Ingest_postgre["ingestionStartTime"] = "";
    Ingest_postgre["ingestionEndTime"] = "";
}

//set tags from the page html
function setTags_postgres(){
    var lengthTags = document.getElementsByName("tagsUsers").length;
    for (i = 0; i<lengthTags; i++){
        var tag = {};
        tag["name"] = document.getElementsByName("tagsUsers")[i].value;
        tags_Structured.push(tag);
    }
}

//set the content of datalakedataset
function setDSDatalake_postgres(){
    DSDatalake_postgre["owner"] = DatasetSource_postgre["owner"];
    DSDatalake_postgre["location"] = DatasetSource_postgre["location"];
    DSDatalake_postgre["name"] = DatasetSource_postgre["name"];
    DSDatalake_postgre["type"] = DatasetSource_postgre["type"];
    DSDatalake_postgre["creationDate"] = getToday() +":00Z";
    DSDatalake_postgre["description"] = document.getElementById("descriptionPostgres").value;
    DSDatalake_postgre["administrator"] = document.getElementById("adminPostgres").value;
}

//get th date of today
function getToday(){
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!
    var yyyy = today.getFullYear();
    var hh = today.getHours();
    var minute = today.getMinutes();
    if (dd < 10) {
        dd = '0' + dd;
    }
    if (mm < 10) {
        mm = '0' + mm;
    }
    if (hh < 10) {
        hh = '0' + hh;
    }
    if (minute < 10) {
        minute = '0' + minute;
    }
    return yyyy + '-' + mm + '-' + dd + 'T' + hh + ':' + minute;
}

//creation of connection of postgresql
async function openConnection() {
    console.log(document.getElementById("ownerPostgres").value);
    console.log(document.getElementById("passwordPostgres").value);
    console.log(document.getElementById("serveurPostgres").value);
    console.log(document.getElementById("portPostgres").value);
    console.log(document.getElementById("dbnamePostgres").value);
    var username = document.getElementById("ownerPostgres").value;
    var password = document.getElementById("passwordPostgres").value;
    var host = document.getElementById("serveurPostgres").value;
    var dbname = document.getElementById("dbnamePostgres").value;
    var port = document.getElementById("portPostgres").value;

    // conString="tcp://postgres:1111@localhost/test"
    // conString="tcp://"+username+":"+password+"@"+host+"/"+dbname
    conString= {
        host: host,
        port: port,
        user: username,
        password: password,
        database: dbname,
    };
    /*conString= {
        host: 'localhost',
            port: 5432,
            user: 'postgres',
            password: '1111',
            database: 'test',
    }*/
    postgre = new pg.Client(conString);

    postgre.connect(function (error, results) {
        if (error) {
            postgre.end();
            return 'clientConnectionReady Error:' + error.message;
        }
        return 'connection success...';
    });
    return postgre.query("SELECT schema_name " +
        "FROM information_schema.schemata " +
        "WHERE schema_name not in ('information_schema','pg_catalog','pg_toast');");
}

//get all the datas in a table(EntityClass)
function getInfoTablePostgres(schemaname,tableName){
    var selectSQLString = 'select * from '+schemaname+'.'+tableName+';'
    return postgre.query(selectSQLString);
}

//get size of a database
function getSizeDB(dbname){
    var selectSQLString = "SELECT pg_size_pretty(pg_database_size('"+dbname+"'));"
    return postgre.query(selectSQLString);
}

//get all metadatas of a database
async function getMetaDB(){
    info = await pgInfo({
        client: postgre,
        schemas: schemasname
    });
    return info;
}

//get metadats of schemas and alert users the result of connection
function getSchemasPostgre(){
    var confirmeConnection = "Please check if the information you entered is correct, please try after 60 seconds";
    openConnection().then(p =>{
        confirmeConnection = "connection succeeded";
        document.getElementById("resultConnection").innerText=confirmeConnection;
        document.getElementById("submitPostgres").disabled = false;

        for (var i=0;i<p.rows.length;i++){
            schemasname.push(p.rows[i]["schema_name"]);
        }
        getMetaDB().then(res => {
            metaPostgre = res.schemas;
            console.log(metaPostgre);
        });
    })
    document.getElementById("resultConnection").innerText=confirmeConnection;
}

//get and set metadata of Entity class
function analyseMetaPostgre(){
    var numericDataType = ["smallint","integer","bigint","decimal","numeric","real","double precision","smallserial","serial","bigserial","money"];
    var schemaInfo = Object.entries(metaPostgre);
    for(var x=0;x<schemaInfo.length;x++){
        // console.log(schemaInfo[x][1])
        var s = {};
        var EntityClass_postgre = [];
        s["name"] = schemaInfo[x][0];
        var tables = Object.entries(schemaInfo[x][1].tables);
        for (var i=0; i<tables.length;i++ ){
            var Entityclass ={};
            Entityclass['name'] = tables[i][0];
            Entityclass['comment'] = tables[i][1].comment;
            var columns = Object.entries(tables[i][1].columns);
            var attributsNominal = [];
            var attributsNumeric = [];
            for (var j=0; j<columns.length;j++ ){
                if(numericDataType.includes(columns[j][1].dataType)){
                    var numericAttribute = {};
                    numericAttribute['name'] = columns[j][0];
                    numericAttribute['type'] = columns[j][1].dataType;
                    attributsNumeric.push(numericAttribute);
                }else{
                    var nominalAttribute = {};
                    nominalAttribute['name'] = columns[j][0];
                    nominalAttribute['type'] = columns[j][1].dataType;
                    attributsNominal.push(nominalAttribute);
                }
            }
            Entityclass["numberOfNumericAttributes"] = attributsNumeric.length;
            Entityclass["numberOfNominalAttributes"] = attributsNominal.length;
            Entityclass['attributes'] = [attributsNumeric,attributsNominal];
            EntityClass_postgre.push(Entityclass);
            for (var n =0;n<EntityClass_postgre.length;n++){
                getInfoTable(s["name"],EntityClass_postgre[n]);
            }
        }
        s["entityClasss"] = EntityClass_postgre;
        schemas.push(s);
    }
}

//prepare all the metadatas needs
function setAllMetadatas() {
    //analyse all metadatas of schemas
    analyseMetaPostgre();
    //set metadatas of dataset
    setDatasetSource_postgres();
    setIngest_postgres();
    setTags_postgres();
    setDSDatalake_postgres();
    //get size of database
    getSizeDB(DatasetSource_postgre["name"]).then(p => {
        DSDatalake_postgre["size"] = p.rows[0]["pg_size_pretty"];
    });
}

//get metadata of each table
function getInfoTable(schemaname,EntityClass_postgre){
    var items = [];
    getInfoTablePostgres(schemaname,EntityClass_postgre.name).then(p => {
        items = p.rows;
        EntityClass_postgre["numberOfInstances"]=p.rowCount;
        EntityClass_postgre["numberOfAttributes"]=p.fields.length;
        var tableContentCSV = preConvert(items);
        var rows = [];
        var columns = [];
        splitCSV(tableContentCSV,rows,columns);
        EntityClass_postgre["numberOfInstancesWithMissingValues"] = countInstancesWithMissingValuesEC(rows);
        //for numeric attribute
        for(var x=0;x<columns.length;x++){
            for (var y=0;y<EntityClass_postgre["attributes"][0].length;y++){
                if(columns[x][0]===EntityClass_postgre["attributes"][0][y].name){
                    // console.log(EntityClass_postgre["attributes"][0][y])
                    EntityClass_postgre.attributes[0][y]["missingValuesCount"] = countMissingValue(columns[x]);
                    var typeAttribute = EntityClass_postgre["attributes"][0][y]["type"];
                    if(typeAttribute === "money"){
                        for (let v in columns[x]) {
                            if(!(columns[x][v] === "null")){
                                columns[x][v] = columns[x][v].substr(0,columns[x][v].length-2);
                                if(columns[x][v].indexOf(",") != -1){
                                    columns[x][v] = columns[x][v].replace(",",".");
                                }
                            }
                        }
                    }
                    EntityClass_postgre.attributes[0][y]["min"] = getMinColumn(columns[x]);
                    EntityClass_postgre.attributes[0][y]["max"] = getMaxColumn(columns[x]);
                }
            }
        }
        //for nominal attributes
        for(var a=0;a<columns.length;a++){
            for (var b=0;b<EntityClass_postgre["attributes"][1].length;b++){
                if(columns[a][0]===EntityClass_postgre.attributes[1][b].name){
                    EntityClass_postgre.attributes[1][b]["missingValuesCount"] = countMissingValue(columns[a]);
                }
            }
        }
        EntityClass_postgre["numberOfMissingValues"] = countMissingValueEC(EntityClass_postgre["attributes"][0]) + countMissingValueEC(EntityClass_postgre["attributes"][1]);
    });
}

//Split the contents of the CSV file into rows and columns
function splitCSV(fileContent,rows,columns){
    var numberLigne = fileContent.split("\n").length -1;
    var contentLigne = fileContent.split("\n");
    for (i=0 ; i<=numberLigne-1; i++){
        var row = contentLigne[i].trim().split(";");
        row[row.length-1] = row[row.length-1].split("\r")[0];
        if(row[row.length-1] == ""){
            row.pop();
        }
        rows.push(row);
    }
    for (x=0 ; x<rows[0].length; x++){
        var column = [];
        for(y=0 ; y<rows.length; y++){
            // console.log(rows[y][x])
            column.push(rows[y][x]);
        }
        columns.push(column);
    }
}

//PreConvert the data in the table into CSV format
function preConvert(items){

    // console.log(items)
    // Convert Object to JSON
    var jsonObject = JSON.stringify(items);

    // Display JSON
    // $('#json').text(jsonObject);

    // Convert JSON to CSV & Display CSV
    // $('#csv').text(ConvertToCSV(jsonObject));
    return ConvertToCSV(jsonObject);
};

//Convert the data in the table into CSV format
function ConvertToCSV(objArray) {
    var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    var str = '';
    for (var header in array[0]) {
        if(str != '')str = str + ';'
        str = str + header;
    }
    str =str + '\r\n';
    for (var i = 0; i < array.length; i++) {
        var line = '';
        for (var index in array[i]) {

            if (line != '') line += ';'

            line += array[i][index];
        }
        str += line + '\r\n';
    }
    return str;
}

//count the number of null values in a column
function countMissingValue(column){
    var numberMissing=0;
    for (i=0;i<column.length;i++) {
        if(column[i]=="" || column[i]=="null"){
            numberMissing = numberMissing+1;
        }
    }
    return numberMissing;
}

//get the minimum value of a column of data
function getMinColumn(column){
    var i=1;
    var trouve = false;
    while(i<column.length && trouve === false){
        if(!isNaN(column[i])){
            trouve = true;
            var min=Number(column[i]);
            for (j=i;j<column.length;j++) {
                if (Number(column[j]) < min) {
                    min = Number(column[j]);
                }
            }
            return min;
        }
        i++;
    }
    if(trouve===false){
        return "no data";
    }
}

//get the maximum value of a column of data
function getMaxColumn(column){
    var i=1;
    var trouve = false;
    while(i<column.length && trouve === false){
        if(!isNaN(column[i])){
            trouve = true;
            var max=Number(column[i]);
            for (j=i;j<column.length;j++) {
                if (Number(column[j]) > max) {
                    max = Number(column[j]);
                }
            }
            return max;
        }
        i++;
    }
    if(trouve===false){
        return "no data";
    }
}

//count missing value of a entity class
function countMissingValueEC(attributes){
    var numberMissingValueEC=0;
    for(i=0;i<attributes.length;i++){
        numberMissingValueEC = attributes[i]["missingValuesCount"] + numberMissingValueEC;
    }
    return numberMissingValueEC;
}

//count the total number of Instances with missing value in a Entity Class
function countInstancesWithMissingValuesEC(rows){
    var numberInstancesWithMissingValuesEC=0;
    for(i=0;i<rows.length;i++){
        if (rows[i].indexOf("") != -1 || rows[i].indexOf("null") != -1){
            numberInstancesWithMissingValuesEC = numberInstancesWithMissingValuesEC + 1;
        }
    }
    return numberInstancesWithMissingValuesEC;
}

//when user confirme to insert all metadatas in Neo4j, excute the insert function and record the time
function confirmInsert(){
    console.log("------------");
    console.log(tags_Structured);
    console.log(DatasetSource_postgre);
    console.log(DSDatalake_postgre);
    console.log(Ingest_postgre);
    console.log(schemas);
    console.log("------------");

    //TODO for record the time
    /*var start = new Date();
    console.log(start)*/
    document.getElementById("waitingBox").style.display="block";
    document.getElementById("confirmSendBox").style.display="none";

    //TODO insert function

    //TODO after insert or the last insert function is finished, user can reload this page
    var timeMS = 3000
    var timeS = timeMS/1000
    setTimeout(function(){
        document.getElementById("resultInsert").innerText="Completed, it took "+timeS +" s";
        document.getElementById("reload").style.display="block";
        }, timeMS);
}

//When the insert into Neo4j is finished, reload this page
function reload(){
    location.reload();
}


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
