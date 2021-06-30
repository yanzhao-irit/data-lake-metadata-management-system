console.log("test")
/*const api = require("../postgreApi");*/

var pg = require('pg');
const pgInfo = require('@wmfs/pg-info');

const apineo4j = require("../neo4jApi");
const _ = require('lodash')

//some variable used in all function
var today = new Date();


var NumberTags = 0;
var tags_Structured = [];
var DatasetSource_postgre = {};
var DSDatalake_postgre = {};
var Ingest_postgre = {};

var metaPostgre = {};
var conString = ""; //tcp://username：password@localhost/dbname
var postgre = ""  ;
var info = "";
var schemasname =[];
var schemas =[];

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('chosedb').addEventListener("click", dbConfirm);
    document.getElementById('add').addEventListener("click", addTag);
    document.getElementById("zone0").addEventListener("input", printTags);
    document.getElementById('submitFile').addEventListener('click',analyseTables);
    document.getElementById('connectionPostgresql').addEventListener('click',getSchemasPostgre);

/*    document.getElementById('confirmBtn').addEventListener('click',confirmInsert);
    document.getElementById('reloadUpload').addEventListener('click',reload);*/

});



function dbConfirm(){
    document.getElementById("databaseChose").style.display="none"
    if(document.getElementById("dbOption").value === "postgresql"){
        document.getElementById("postgresqlOption").style.display="block";
    }else{
        document.getElementById("oracleOption").style.display="block"
    }
}
// window.onload = getMetaPostgre();

//show tags in dropdown menu
function printTags() {
    var zone = "zone" + NumberTags;
    var zoneaff = "zoneaff" + NumberTags;
    var lien = "lien" + NumberTags;
    var elt2 = document.getElementById(zoneaff);
    // console.log(elt2)
    elt2.innerText=""
    //To receive result of BD
    var length = 0;
    var tag = document.getElementById(zone).value;
    apineo4j.getTags(tag).then(p => {
        length = p.length;
        for (x = 0; x < length; x++) {
            console.log(p[x].name)
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
        "<ul class='dropdown-menu' id='zoneaff" + NumberTags + "' style='margin-left:33%;height:100px;width:270px;overflow:scroll;'></ul></div>")
    var zone = "zone" + NumberTags;
    console.log(document.getElementById(zone))
    document.getElementById(zone).addEventListener("input", printTags);
}

//set the owner and location of dataset form the html page
function setDatasetSource_postgres(){
    DatasetSource_postgre["owner"] = document.getElementById("ownerPostgres").value
    DatasetSource_postgre["location"] = document.getElementById("serveurPostgres").value
    DatasetSource_postgre["name"] = document.getElementById("dbnamePostgres").value
    DatasetSource_postgre["type"] = "Structured dataset"
}

//set the ingest start time and end time form the html page
function setIngest_postgres(){
    Ingest_postgre["ingestionMode"] = "batch"
    Ingest_postgre["ingestionStartTime"] = ""
    Ingest_postgre["ingestionEndTime"] = ""
}

//set tags from the page html
function setTags_postgres(){
    var lengthTags = document.getElementsByName("tagsUsers").length
    for (i = 0; i<lengthTags; i++){
        var tag = {};
        tag["name"] = document.getElementsByName("tagsUsers")[i].value
        tags_Structured.push(tag)
    }
}

//set the content of datalakedataset
function setDSDatalake_postgres(){
    DSDatalake_postgre["owner"] = DatasetSource_postgre["owner"]
    DSDatalake_postgre["location"] = DatasetSource_postgre["location"]
    DSDatalake_postgre["name"] = DatasetSource_postgre["name"]
    DSDatalake_postgre["type"] = DatasetSource_postgre["type"]
    DSDatalake_postgre["creationDate"] = getToday() +":00Z"
    DSDatalake_postgre["description"] = document.getElementById("descriptionPostgres").value
    DSDatalake_postgre["administrator"] = document.getElementById("adminPostgres").value
}


//get th date of today
function getToday(){
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!
    var yyyy = today.getFullYear();
    var hh = today.getHours();
    var minute = today.getMinutes();
    if (dd < 10) {
        dd = '0' + dd
    }
    if (mm < 10) {
        mm = '0' + mm
    }
    if (hh < 10) {
        hh = '0' + hh
    }
    if (minute < 10) {
        minute = '0' + minute
    }
    return yyyy + '-' + mm + '-' + dd + 'T' + hh + ':' + minute;
}

//When click Send, collect all datas in page and call function to insert in BD
/*function analyseCSV(){
    if (DatasetSource_postgre["type"]==="Unstructured dataset"){
        setTags();
        setDatasetSource();
        setDSDatalake();
        setIngest();

        tags_Structured = JSON.stringify(tags_Structured).replace(/\"/g, "")
        tags_Structured = JSON.stringify(tags_Structured).replace(/\:/g,"\:\"").replace(/\,/g,"\"\,").replace(/\}\]/g,"\"\}\]").replace(/\}\"\,\{/g,"\"\}\,\{")
        tags_Structured = tags_Structured.replace(/^\"|\"$/g,'')

        console.log("---------")
        console.log(DatasetSource_postgre)
        console.log(Ingest_postgre)
        console.log(DSDatalake_postgre)
        console.log(tags_Structured)
        console.log("---------")
    }
}*/


async function openConnection() {
    console.log(document.getElementById("ownerPostgres").value)
    console.log(document.getElementById("passwordPostgres").value)
    console.log(document.getElementById("serveurPostgres").value)
    console.log(document.getElementById("dbnamePostgres").value)
    var username = document.getElementById("ownerPostgres").value
    var password = document.getElementById("passwordPostgres").value
    var host = document.getElementById("serveurPostgres").value
    var dbname = document.getElementById("dbnamePostgres").value
    var port = document.getElementById("portPostgres").value


    // conString="tcp://postgres:1111@localhost/test"
    // conString="tcp://"+username+":"+password+"@"+host+"/"+dbname
    conString= {
        host: host,
        port: port,
        user: username,
        password: password,
        database: dbname,
    }
    /*conString= {
        host: 'localhost',
            port: 5432,
            user: 'postgres',
            password: '1111',
            database: 'test',
    }*/
    postgre = new pg.Client(conString)

    postgre.connect(function (error, results) {
        if (error) {
            postgre.end();
            return 'clientConnectionReady Error:' + error.message;
        }
        return 'connection success...';
    });
    return postgre.query("SELECT schema_name " +
        "FROM information_schema.schemata " +
        "WHERE schema_name not in ('information_schema','pg_catalog','pg_toast');")
}

function getInfoTablePostgres(schemaname,tableName){
    var selectSQLString = 'select * from '+schemaname+'.'+tableName+';'
    return postgre.query(selectSQLString);
}

function getSizeDB(dbname){
    var selectSQLString = "SELECT pg_size_pretty(pg_database_size('"+dbname+"'));"
    return postgre.query(selectSQLString);
}

async function test(){
    info = await pgInfo({
        client: postgre,
        schemas: schemasname
    });
    return info;
}

function getSchemasPostgre(){
    var confirmeConnection = "Please check if the information you entered is correct, please try after 60 seconds"
    openConnection().then(p =>{
        confirmeConnection = "connection succeeded"
        document.getElementById("resultConnection").innerText=confirmeConnection;
        /*console.log(p.rows)
        console.log("passe")*/
        for (var i=0;i<p.rows.length;i++){
            schemasname.push(p.rows[i]["schema_name"])
        }
        console.log(schemasname)
        console.log(test().then(res => {
            metaPostgre = res.schemas;
            console.log(metaPostgre);
        }));

    })
    document.getElementById("resultConnection").innerText=confirmeConnection;
}

// get metadata of Entity class
function analyseMetaPostgre(){
    var schemaInfo = Object.entries(metaPostgre)
    for(var x=0;x<schemaInfo.length;x++){
        console.log(schemaInfo[x][1])
        var s = {};
        var EntityClass_postgre = [];
        s["name"] = schemaInfo[x][0]
        var tables = Object.entries(schemaInfo[x][1].tables)
        // console.log(tables)
        for (var i=0; i<tables.length;i++ ){
            var Entityclass ={}
            Entityclass['name'] = tables[i][0]
            Entityclass['comment'] = tables[i][1].comment
            var columns = Object.entries(tables[i][1].columns)
            // console.log(columns)
            var attributsNominal = []
            var attributsNumeric = []
            for (var j=0; j<columns.length;j++ ){
                //TODO Need to find other type of numeric
                if(columns[j][1].dataType==="integer"){
                    var numericAttribute = {}
                    numericAttribute['name'] = columns[j][0]
                    numericAttribute['type'] = columns[j][1].dataType
                    attributsNumeric.push(numericAttribute)
                }else{
                    var nominalAttribute = {}
                    nominalAttribute['name'] = columns[j][0]
                    nominalAttribute['type'] = columns[j][1].dataType
                    attributsNominal.push(nominalAttribute)
                }
            }
            Entityclass["numberOfNumericAttributes"] = attributsNumeric.length
            Entityclass["numberOfNominalAttributes"] = attributsNominal.length
            Entityclass['attributes'] = [attributsNumeric,attributsNominal]
            EntityClass_postgre.push(Entityclass)
            for (var n =0;n<EntityClass_postgre.length;n++){
                getInfoTable(s["name"],EntityClass_postgre[n])
            }
        }
        s["entityClasss"] = EntityClass_postgre
        schemas.push(s)
    }
    console.log(schemas)
}

function analyseTables(){
    setDatasetSource_postgres();
    setIngest_postgres();
    setTags_postgres();
    setDSDatalake_postgres();

    getSizeDB(DatasetSource_postgre["name"]).then(p =>{
        console.log(p.rows[0]["pg_size_pretty"])
        DSDatalake_postgre["size"] = p.rows[0]["pg_size_pretty"]
    });
    console.log("------------")
    console.log(tags_Structured);
    console.log(DatasetSource_postgre);
    console.log(DSDatalake_postgre);
    console.log(Ingest_postgre);
    console.log("------------")
    analyseMetaPostgre();
   /* console.log(EntityClass_postgre)

    for (var n =0;n<EntityClass_postgre.length;n++){
        getInfoTable(EntityClass_postgre[n])
    }
    // getInfoTable(EntityClass_postgre[2])
    console.log(EntityClass_postgre)
    // getInfoTable(EntityClass_postgre[0])*/
}

//get metadata of each table
function getInfoTable(schemaname,EntityClass_postgre){
    var items = [];

    getInfoTablePostgres(schemaname,EntityClass_postgre.name).then(p => {
        /*console.log(p)
        console.log(p.rows)*/
        items = p.rows
        EntityClass_postgre["numberOfInstances"]=p.rowCount
        EntityClass_postgre["numberOfAttributes"]=p.fields.length
        var tableContentCSV = preConvert(items);
        var rows = [];
        var columns = [];
        // console.log(tableContentCSV);
        splitCSV(tableContentCSV,rows,columns);
        // console.log(rows);
        EntityClass_postgre["numberOfInstancesWithMissingValues"] = countInstancesWithMissingValuesEC(rows);
        //for numeric attribute
        // console.log(EntityClass_postgre)
        for(var x=0;x<columns.length;x++){
            for (var y=0;y<EntityClass_postgre["attributes"][0].length;y++){
                if(columns[x][0]===EntityClass_postgre["attributes"][0][y].name){
                    // console.log(EntityClass_postgre["attributes"][0][y])
                    EntityClass_postgre.attributes[0][y]["min"] = getMinColumn(columns[x])
                    EntityClass_postgre.attributes[0][y]["max"] = getMaxColumn(columns[x])
                    EntityClass_postgre.attributes[0][y]["missingValuesCount"] = countMissingValue(columns[x])
                }
            }
        }
        //for nominal attributes
        for(var a=0;a<columns.length;a++){
            for (var b=0;b<EntityClass_postgre["attributes"][1].length;b++){
                if(columns[a][0]===EntityClass_postgre.attributes[1][b].name){
                    EntityClass_postgre.attributes[1][b]["missingValuesCount"] = countMissingValue(columns[a])
                }
            }
        }
        EntityClass_postgre["numberOfMissingValues"] = countMissingValueEC(EntityClass_postgre["attributes"][0]) + countMissingValueEC(EntityClass_postgre["attributes"][1])
        // console.log(EntityClass_postgre)
    });
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
        // console.log(header);
        if(str != '')str = str + ','
        str = str + header
    }
    str =str + '\r\n';
    // console.log(str)
    for (var i = 0; i < array.length; i++) {
        var line = '';
        for (var index in array[i]) {

            if (line != '') line += ','

            line += array[i][index];
        }

        str += line + '\r\n';
    }
    // console.log(str);
    return str;
}


//Split the contents of the CSV file into rows and columns
function splitCSV(fileContent,rows,columns){
    var numberLigne = fileContent.split("\n").length -1
    var contentLigne = fileContent.split("\n")
    for (i=0 ; i<=numberLigne-1; i++){
        var row = contentLigne[i].trim().split(",")
        row[row.length-1] = row[row.length-1].split("\r")[0]
        if(row[row.length-1] == ""){
            row.pop()
        }
        rows.push(row)
    }
    for (x=0 ; x<rows[0].length; x++){
        var column = [];
        for(y=0 ; y<rows.length; y++){
            // console.log(rows[y][x])
            column.push(rows[y][x])
        }
        columns.push(column)
    }
    /*console.log(rows)
    console.log(columns)*/
}

//count the number of null values in a column
function countMissingValue(column){
    var numberMissing=0
    for (i=0;i<column.length;i++) {
        if(column[i]==""){
            numberMissing = numberMissing+1
        }
    }
    return numberMissing
}

//get the minimum value of a column of data
function getMinColumn(column){
    var min=Number(column[1])
    for (i=1;i<column.length;i++) {
        if (Number(column[i]) < min) {
            min = Number(column[i])
        }
    }
    return min
}

//get the maximum value of a column of data
function getMaxColumn(column){
    var max=Number(column[1])
    for (i=1;i<column.length;i++) {
        if (Number(column[i]) > max) {
            max = Number(column[i])
        }
    }
    return max
}

//count missing value of a entity class
function countMissingValueEC(attributes){
    var numberMissingValueEC=0
    for(i=0;i<attributes.length;i++){
        numberMissingValueEC = attributes[i]["missingValuesCount"] + numberMissingValueEC
    }
    return numberMissingValueEC
}

//count the total number of Instances with missing value in a Entity Class
function countInstancesWithMissingValuesEC(rows){
    var numberInstancesWithMissingValuesEC=0
    for(i=0;i<rows.length;i++){
        // console.log(countMissingValue(rows[i]))
        if (rows[i].indexOf("") != -1){
            numberInstancesWithMissingValuesEC = numberInstancesWithMissingValuesEC + 1
        }
    }
    return numberInstancesWithMissingValuesEC
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
