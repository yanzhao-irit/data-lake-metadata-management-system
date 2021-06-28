console.log("test")
const api = require("../postgreApi");

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('add').addEventListener("click", addTag);
    document.getElementById("zone0").addEventListener("input", printTags);
    document.getElementById('submitFile').addEventListener('click',testApi2);
/*    document.getElementById('confirmBtn').addEventListener('click',confirmInsert);
    document.getElementById('reloadUpload').addEventListener('click',reload);*/

});

//some variable used in all function
var today = new Date();

var metaPostgre = {};
var NumberTags = 0;
var fileExtName ="";
var tags_Structured = [];
var DatasetSource_postgre = {};
var DSDatalake_postgre = {};
var Ingest_postgre = {};
var EntityClass_postgre = [];

window.onload = getMetaPostgre();

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
    api.getTags(tag).then(p => {
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
function setDatasetSource(){
    DatasetSource_postgre["owner"] = document.getElementById("owner").value
    DatasetSource_postgre["location"] = document.getElementById("urlDS").value
}

//set the ingest start time and end time form the html page
function setIngest(){
    Ingest_postgre["ingestionMode"] = "batch"
    Ingest_postgre["ingestionStartTime"] = ""
    Ingest_postgre["ingestionEndTime"] = ""
}

//set tags from the page html
function setTags(){
    var lengthTags = document.getElementsByName("tagsUsers").length
    for (i = 0; i<lengthTags; i++){
        var tag = {};
        tag["name"] = document.getElementsByName("tagsUsers")[i].value
        tags_Structured.push(tag)
    }
}

//set the content of datalakedataset
function setDSDatalake(){
    DSDatalake_postgre["owner"] = DatasetSource_postgre["owner"]
    DSDatalake_postgre["location"] = DatasetSource_postgre["location"]
    DSDatalake_postgre["name"] = DatasetSource_postgre["name"]
    DSDatalake_postgre["type"] = DatasetSource_postgre["type"]
    DSDatalake_postgre["filenameExtension"] = fileExtName
    DSDatalake_postgre["creationDate"] = getToday() +":00Z"
    DSDatalake_postgre["description"] = document.getElementById("description").value
    DSDatalake_postgre["connectionURL"] = document.getElementById("urlDS").value
    DSDatalake_postgre["administrator"] = document.getElementById("admin").value
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

function getMetaPostgre(){
    api.openConnection().then(p =>{
        metaPostgre = p.schemas.public.tables;
        console.log(metaPostgre);
    })
}

function testApi2(){
    analyseMetaPostgre();
    getInfoTable();
}

function analyseMetaPostgre(){
    var tables = Object.entries(metaPostgre)
    // console.log(tables)
    for (var i=0; i<tables.length;i++ ){
        var Entityclass ={}
        Entityclass['name'] = tables[i][0]
        Entityclass['comment'] = tables[i][1].comment
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
    console.log(EntityClass_postgre)
}

function getInfoTable(){
    api.getInfoTable("actor").then(p => {
        console.log(p);
    })
}

function preConvert() {
    var items = [];
    // Create Object
    api.getInfoTable("actor").then(p =>{
        items = p.rows;
    });

    // Convert Object to JSON
    var jsonObject = JSON.stringify(items);

    // Display JSON
    $('#json').text(jsonObject);

    // Convert JSON to CSV & Display CSV
    $('#csv').text(ConvertToCSV(jsonObject));
};

function ConvertToCSV(objArray) {
    var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    var str = '';

    for (var i = 0; i < array.length; i++) {
        var line = '';
        for (var index in array[i]) {
            if (line != '') line += ','

            line += array[i][index];
        }

        str += line + '\r\n';
    }

    return str;
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
