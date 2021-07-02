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

var countSize = 0;
var countTable = 0;
var metaPostgre = {};
var conString = ""; //tcp://username：password@localhost/dbname
var postgre = "";
var info = "";
var schemasname = [];
var schemas = [];

var start = "";

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('chosedb').addEventListener("click", dbConfirm);
    document.getElementById('add').addEventListener("click", addTag);
    document.getElementById("zone0").addEventListener("input", printTags);
    document.getElementById('connectionPostgresql').addEventListener('click', getSchemasPostgre);
    document.getElementById('submitPostgres').addEventListener('click', setAllMetadatas);
    document.getElementById('confirmBtn').addEventListener('click', confirmInsert);
    document.getElementById('reloadUpload').addEventListener('click', reload);

    document.getElementById("ownerPostgres").addEventListener('input', disabledSend);
    document.getElementById("passwordPostgres").addEventListener('input', disabledSend);
    document.getElementById("serveurPostgres").addEventListener('input', disabledSend);
    document.getElementById("dbnamePostgres").addEventListener('input', disabledSend);
    document.getElementById("portPostgres").addEventListener('input', disabledSend);
});

//chose a db option, go to the db option page
function dbConfirm() {
    document.getElementById("databaseChose").style.display = "none";
    if (document.getElementById("dbOption").value === "postgresql") {
        document.getElementById("postgresqlOption").style.display = "block";
    } else {
        document.getElementById("oracleOption").style.display = "block";
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
    elt.insertAdjacentHTML("beforeend", "<div class='dropdown'><label for='zone" + NumberTags + "'>Tag " + (NumberTags + 1) + ": </label>" +
        "<input name='tagsUsers' type='text' id='zone" + NumberTags + "' data-toggle='dropdown' required>" +
        "<ul class='dropdown-menu' id='zoneaff" + NumberTags + "' style='margin-left:33%;height:100px;width:270px;overflow:scroll;'></ul></div>");
    var zone = "zone" + NumberTags;
    console.log(document.getElementById(zone));
    document.getElementById(zone).addEventListener("input", printTags);
}

//set the owner and location of dataset form the html page
function setDatasetSource_postgres() {
    DatasetSource_postgre["owner"] = document.getElementById("ownerPostgres").value;
    DatasetSource_postgre["location"] = document.getElementById("serveurPostgres").value;
    DatasetSource_postgre["name"] = document.getElementById("dbnamePostgres").value;
    DatasetSource_postgre["type"] = "Structured dataset";
}

//set the ingest start time and end time form the html page
function setIngest_postgres() {
    Ingest_postgre["ingestionMode"] = "batch";
    Ingest_postgre["ingestionStartTime"] = "";
    Ingest_postgre["ingestionEndTime"] = "";
}

//set tags from the page html
function setTags_postgres() {
    tags_Structured = [];
    var lengthTags = document.getElementsByName("tagsUsers").length;
    for (i = 0; i < lengthTags; i++) {
        var tag = {};
        tag["name"] = document.getElementsByName("tagsUsers")[i].value;
        tags_Structured.push(tag);
    }
}

//set the content of datalakedataset
function setDSDatalake_postgres() {
    DSDatalake_postgre["owner"] = DatasetSource_postgre["owner"];
    DSDatalake_postgre["location"] = DatasetSource_postgre["location"];
    DSDatalake_postgre["name"] = DatasetSource_postgre["name"];
    DSDatalake_postgre["type"] = DatasetSource_postgre["type"];
    DSDatalake_postgre["creationDate"] = getToday() + ":00Z";
    DSDatalake_postgre["description"] = document.getElementById("descriptionPostgres").value;
    DSDatalake_postgre["administrator"] = document.getElementById("adminPostgres").value;
}

//get th date of today
function getToday() {
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

//make sure every time database options change, user need to test connection
function disabledSend(){
    document.getElementById("submitPostgres").disabled = true;
    document.getElementById("resultConnection").innerText = "";
}

//creation of connection of postgresql
async function openConnection() {
    // console.log(document.getElementById("ownerPostgres").value);
    // console.log(document.getElementById("passwordPostgres").value);
    // console.log(document.getElementById("serveurPostgres").value);
    // console.log(document.getElementById("portPostgres").value);
    // console.log(document.getElementById("dbnamePostgres").value);
    var username = document.getElementById("ownerPostgres").value;
    var password = document.getElementById("passwordPostgres").value;
    var host = document.getElementById("serveurPostgres").value;
    var dbname = document.getElementById("dbnamePostgres").value;
    var port = document.getElementById("portPostgres").value;

    // conString="tcp://postgres:1111@localhost/test"
    // conString="tcp://"+username+":"+password+"@"+host+"/"+dbname
    conString = {
        host: host,
        port: port,
        user: username,
        password: password,
        database: dbname,
    };
    /*    conString= {
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
function getInfoTablePostgres(schemaname, tableName) {
    var selectSQLString = 'select * from ' + schemaname + '.' + tableName + ';'
    return postgre.query(selectSQLString);
}

//get size of a database
function getSizeDB(dbname) {
    var selectSQLString = "SELECT pg_size_pretty(pg_database_size('" + dbname + "'));"
    return postgre.query(selectSQLString);
}

//get all metadatas of a database
async function getMetaDB() {
    info="";
    info = await pgInfo({
        client: postgre,
        schemas: schemasname
    });
    return info;
}

//get metadats of schemas and alert users the result of connection
function getSchemasPostgre() {
    //if the the dn change, initialize the object
    metaPostgre = {};
    schemas=[];
    schemasname=[];

    var confirmeConnection = "Please check if the information you entered is correct, please try after 60 seconds";

    var username = document.getElementById("ownerPostgres").value;
    var password = document.getElementById("passwordPostgres").value;
    var host = document.getElementById("serveurPostgres").value;
    var dbname = document.getElementById("dbnamePostgres").value;
    var port = document.getElementById("portPostgres").value;

    //if the user didn't enter db options, they can't send or analyse metadatas of db postgres
    if(username === "" || password==="" || host==="" || dbname==="" || port===""){
        document.getElementById("resultConnection").innerText = "Please fill in all database connection settings";
        document.getElementById("submitPostgres").disabled = true;
    }else{
        openConnection().then(p => {
            confirmeConnection = "connection succeeded";
            document.getElementById("resultConnection").innerText = confirmeConnection;
            document.getElementById("submitPostgres").disabled = false;

            for (var i = 0; i < p.rows.length; i++) {
                schemasname.push(p.rows[i]["schema_name"]);
            }
            getMetaDB().then(res => {
                metaPostgre = res.schemas;
                console.log(metaPostgre);
            });
        })
        document.getElementById("resultConnection").innerText = confirmeConnection;
        if(confirmeConnection === "Please check if the information you entered is correct, please try after 60 seconds") {
            document.getElementById("submitPostgres").disabled = true;
        }
    }
}

//get and set metadata of Entity class
function analyseMetaPostgre() {
    var numericDataType = ["smallint", "integer", "bigint", "decimal", "numeric", "real", "double precision", "smallserial", "serial", "bigserial", "money"];
    var schemaInfo = Object.entries(metaPostgre);
    for (var x = 0; x < schemaInfo.length; x++) {
        // console.log(schemaInfo[x][1])
        var s = {};
        var EntityClass_postgre = [];
        s["name"] = schemaInfo[x][0];
        var tables = Object.entries(schemaInfo[x][1].tables);
        for (var i = 0; i < tables.length; i++) {
            var Entityclass = {};
            Entityclass['name'] = tables[i][0];
            Entityclass['comment'] = tables[i][1].comment;
            var columns = Object.entries(tables[i][1].columns);
            var attributsNominal = [];
            var attributsNumeric = [];
            for (var j = 0; j < columns.length; j++) {
                if (numericDataType.includes(columns[j][1].dataType)) {
                    var numericAttribute = {};
                    numericAttribute['name'] = columns[j][0];
                    numericAttribute['type'] = columns[j][1].dataType;
                    attributsNumeric.push(numericAttribute);
                } else {
                    var nominalAttribute = {};
                    nominalAttribute['name'] = columns[j][0];
                    nominalAttribute['type'] = columns[j][1].dataType;
                    attributsNominal.push(nominalAttribute);
                }
            }
            Entityclass["numberOfNumericAttributes"] = attributsNumeric.length;
            Entityclass["numberOfNominalAttributes"] = attributsNominal.length;
            Entityclass['attributes'] = [attributsNumeric, attributsNominal];
            EntityClass_postgre.push(Entityclass);
            for (var n = 0; n < EntityClass_postgre.length; n++) {

                getInfoTable(s["name"], EntityClass_postgre[n]);

            }
        }
        s["entityClasses"] = EntityClass_postgre;
        schemas.push(s);
    }
}

//prepare all the metadatas needs
function setAllMetadatas() {

    //set metadatas of dataset
    setDatasetSource_postgres();
    setIngest_postgres();
    setTags_postgres();
    setDSDatalake_postgres();

    //if the db don't change
    if(schemas.length===0){
        countTable = 0;
        countSize=0;
        //analyse all metadatas of schemas
        analyseMetaPostgre();
        //get size of database
        getSizeDB(DatasetSource_postgre["name"]).then(p => {
            DSDatalake_postgre["size"] = p.rows[0]["pg_size_pretty"];
            countSize = countSize + 1
        });
    }

    console.log("------------");
    console.log(tags_Structured);
    console.log(DatasetSource_postgre);
    console.log(DSDatalake_postgre);
    console.log(Ingest_postgre);
    console.log(schemas);
    console.log("------------");

}

//get metadata of each table
function getInfoTable(schemaname, EntityClass_postgre) {
    var items = [];
    getInfoTablePostgres(schemaname, EntityClass_postgre.name).then(p => {
        items = p.rows;
        EntityClass_postgre["numberOfInstances"] = p.rowCount;
        EntityClass_postgre["numberOfAttributes"] = p.fields.length;
        var tableContentCSV = preConvert(items);
        var rows = [];
        var columns = [];
        splitCSV(tableContentCSV, rows, columns);
        EntityClass_postgre["numberOfInstancesWithMissingValues"] = countInstancesWithMissingValuesEC(rows);
        //for numeric attribute
        for (var x = 0; x < columns.length; x++) {
            for (var y = 0; y < EntityClass_postgre["attributes"][0].length; y++) {
                if (columns[x][0] === EntityClass_postgre["attributes"][0][y].name) {
                    // console.log(EntityClass_postgre["attributes"][0][y])
                    EntityClass_postgre.attributes[0][y]["missingValuesCount"] = countMissingValue(columns[x]);
                    var typeAttribute = EntityClass_postgre["attributes"][0][y]["type"];
                    if (typeAttribute === "money") {
                        for (let v in columns[x]) {
                            if (!(columns[x][v] === "null")) {
                                columns[x][v] = columns[x][v].substr(0, columns[x][v].length - 2);
                                if (columns[x][v].indexOf(",") != -1) {
                                    columns[x][v] = columns[x][v].replace(",", ".");
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
        for (var a = 0; a < columns.length; a++) {
            for (var b = 0; b < EntityClass_postgre["attributes"][1].length; b++) {
                if (columns[a][0] === EntityClass_postgre.attributes[1][b].name) {
                    EntityClass_postgre.attributes[1][b]["missingValuesCount"] = countMissingValue(columns[a]);
                }
            }
        }
        EntityClass_postgre["numberOfMissingValues"] = countMissingValueEC(EntityClass_postgre["attributes"][0]) + countMissingValueEC(EntityClass_postgre["attributes"][1]);
        countTable = countTable + 1;

    });
}

//Split the contents of the CSV file into rows and columns
function splitCSV(fileContent, rows, columns) {
    var numberLigne = fileContent.split("\n").length - 1;
    var contentLigne = fileContent.split("\n");
    for (i = 0; i <= numberLigne - 1; i++) {
        var row = contentLigne[i].trim().split(";");
        row[row.length - 1] = row[row.length - 1].split("\r")[0];
        if (row[row.length - 1] == "") {
            row.pop();
        }
        rows.push(row);
    }
    for (x = 0; x < rows[0].length; x++) {
        var column = [];
        for (y = 0; y < rows.length; y++) {
            // console.log(rows[y][x])
            column.push(rows[y][x]);
        }
        columns.push(column);
    }
}

//PreConvert the data in the table into CSV format
function preConvert(items) {

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
        if (str != '') str = str + ';'
        str = str + header;
    }
    str = str + '\r\n';
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
function countMissingValue(column) {
    var numberMissing = 0;
    for (i = 0; i < column.length; i++) {
        if (column[i] == "" || column[i] == "null") {
            numberMissing = numberMissing + 1;
        }
    }
    return numberMissing;
}

//get the minimum value of a column of data
function getMinColumn(column) {
    var i = 1;
    var trouve = false;
    while (i < column.length && trouve === false) {
        if (!isNaN(column[i])) {
            trouve = true;
            var min = Number(column[i]);
            for (j = i; j < column.length; j++) {
                if (Number(column[j]) < min) {
                    min = Number(column[j]);
                }
            }
            return min;
        }
        i++;
    }
    if (trouve === false) {
        return "no data";
    }
}

//get the maximum value of a column of data
function getMaxColumn(column) {
    var i = 1;
    var trouve = false;
    while (i < column.length && trouve === false) {
        if (!isNaN(column[i])) {
            trouve = true;
            var max = Number(column[i]);
            for (j = i; j < column.length; j++) {
                if (Number(column[j]) > max) {
                    max = Number(column[j]);
                }
            }
            return max;
        }
        i++;
    }
    if (trouve === false) {
        return "no data";
    }
}

//count missing value of a entity class
function countMissingValueEC(attributes) {
    var numberMissingValueEC = 0;
    for (i = 0; i < attributes.length; i++) {
        numberMissingValueEC = attributes[i]["missingValuesCount"] + numberMissingValueEC;
    }
    return numberMissingValueEC;
}

//count the total number of Instances with missing value in a Entity Class
function countInstancesWithMissingValuesEC(rows) {
    var numberInstancesWithMissingValuesEC = 0;
    for (i = 0; i < rows.length; i++) {
        if (rows[i].indexOf("") != -1 || rows[i].indexOf("null") != -1) {
            numberInstancesWithMissingValuesEC = numberInstancesWithMissingValuesEC + 1;
        }
    }
    return numberInstancesWithMissingValuesEC;
}

//when user confirme to insert all metadatas in Neo4j, excute the insert function and record the time
function confirmInsert() {
    start = new Date();
    console.log(start)

    document.getElementById("waitingBox").style.display = "block";
    document.getElementById("confirmSendBox").style.display = "none";

    var stock = 0;
    var interval = setInterval(function () {
        // console.log("doing")
        if (countSize === 1 && stock === countTable) {
            clearInterval(interval);
            var analysisDSRelationships = [];
            var RelationshipDS = [];
            var dlStructuredDatasets = [];
            var entityClasses = [];
            var numericAttributes = [];
            var nominalAttributes = [];

            var hasRelationshipDS = [];
            var withDataset = [];
            var hasEntityClass = [];
            var hasAttribute = [];

            prepareNoeuds(analysisDSRelationships, RelationshipDS, dlStructuredDatasets, entityClasses, numericAttributes, nominalAttributes, hasRelationshipDS, withDataset,hasEntityClass,hasAttribute);

            analysisDSRelationships = JSON.stringify(analysisDSRelationships).replace(/\"/g, "")
            analysisDSRelationships = JSON.stringify(analysisDSRelationships).replace(/\:/g, "\:\"").replace(/\,/g, "\"\,").replace(/\}\]/g, "\"\}\]").replace(/\}\"\,\{/g, "\"\}\,\{")
            analysisDSRelationships = analysisDSRelationships.replace(/^\"|\"$/g, '')

            RelationshipDS = JSON.stringify(RelationshipDS).replace(/\"/g, "")
            RelationshipDS = JSON.stringify(RelationshipDS).replace(/\:/g, "\:\"").replace(/\,/g, "\"\,").replace(/\}\]/g, "\"\}\]").replace(/\}\"\,\{/g, "\"\}\,\{")
            RelationshipDS = RelationshipDS.replace(/^\"|\"$/g, '')

            dlStructuredDatasets = JSON.stringify(dlStructuredDatasets).replace(/\"/g, "")
            dlStructuredDatasets = JSON.stringify(dlStructuredDatasets).replace(/\:/g, "\:\"").replace(/\,/g, "\"\,").replace(/\}\]/g, "\"\}\]").replace(/\}\"\,\{/g, "\"\}\,\{")
            dlStructuredDatasets = dlStructuredDatasets.replace(/^\"|\"$/g, '')

            entityClasses = JSON.stringify(entityClasses).replace(/\"/g, "")
            entityClasses = JSON.stringify(entityClasses).replace(/\:/g, "\:\"").replace(/\,/g, "\"\,").replace(/\}\]/g, "\"\}\]").replace(/\}\"\,\{/g, "\"\}\,\{")
            entityClasses = entityClasses.replace(/^\"|\"$/g, '')

            numericAttributes = JSON.stringify(numericAttributes).replace(/\"/g, "")
            numericAttributes = JSON.stringify(numericAttributes).replace(/\:/g, "\:\"").replace(/\,/g, "\"\,").replace(/\}\]/g, "\"\}\]").replace(/\}\"\,\{/g, "\"\}\,\{")
            numericAttributes = numericAttributes.replace(/^\"|\"$/g, '')

            nominalAttributes = JSON.stringify(nominalAttributes).replace(/\"/g, "")
            nominalAttributes = JSON.stringify(nominalAttributes).replace(/\:/g, "\:\"").replace(/\,/g, "\"\,").replace(/\}\]/g, "\"\}\]").replace(/\}\"\,\{/g, "\"\}\,\{")
            nominalAttributes = nominalAttributes.replace(/^\"|\"$/g, '')

            console.log(analysisDSRelationships)
            console.log(RelationshipDS)
            console.log(dlStructuredDatasets)
            console.log(entityClasses)
            console.log(numericAttributes)
            console.log(nominalAttributes)

            hasRelationshipDS = JSON.stringify(hasRelationshipDS).replace(/\"/g, "")
            hasRelationshipDS = JSON.stringify(hasRelationshipDS).replace(/\:/g, "\:\"").replace(/\,/g, "\"\,").replace(/\}\]/g, "\"\}\]").replace(/\}\"\,\{/g, "\"\}\,\{")
            hasRelationshipDS = hasRelationshipDS.replace(/^\"|\"$/g, '')

            withDataset = JSON.stringify(withDataset).replace(/\"/g, "")
            withDataset = JSON.stringify(withDataset).replace(/\:/g, "\:\"").replace(/\,/g, "\"\,").replace(/\}\]/g, "\"\}\]").replace(/\}\"\,\{/g, "\"\}\,\{")
            withDataset = withDataset.replace(/^\"|\"$/g, '')

            hasEntityClass = JSON.stringify(hasEntityClass).replace(/\"/g, "")
            hasEntityClass = JSON.stringify(hasEntityClass).replace(/\:/g, "\:\"").replace(/\,/g, "\"\,").replace(/\}\]/g, "\"\}\]").replace(/\}\"\,\{/g, "\"\}\,\{")
            hasEntityClass = hasEntityClass.replace(/^\"|\"$/g, '')

            hasAttribute = JSON.stringify(hasAttribute).replace(/\"/g, "")
            hasAttribute = JSON.stringify(hasAttribute).replace(/\:/g, "\:\"").replace(/\,/g, "\"\,").replace(/\}\]/g, "\"\}\]").replace(/\}\"\,\{/g, "\"\}\,\{")
            hasAttribute = hasAttribute.replace(/^\"|\"$/g, '')

            //call the insert function of neo4j
            insertNeo4jNoeud(analysisDSRelationships, RelationshipDS, dlStructuredDatasets, entityClasses, numericAttributes, nominalAttributes);
            setTimeout(function () {
                insertNeo4jRelationships(hasRelationshipDS,withDataset,hasEntityClass,hasAttribute)
            }, 1000);
        }
        stock = countTable;
    }, 1000)
}

//for generate the GUID
function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

//prepare Noeuds of insert into Neo4j
function prepareNoeuds(analysisDSRelationships, RelationshipDS, dlStructuredDatasets, entityClasses, numericAttributes, nominalAttributes, hasRelationshipDS,withDataset,hasEntityClass,hasAttribute) {
    tags_Structured = JSON.stringify(tags_Structured).replace(/\"/g, "")
    tags_Structured = JSON.stringify(tags_Structured).replace(/\:/g, "\:\"").replace(/\,/g, "\"\,").replace(/\}\]/g, "\"\}\]").replace(/\}\"\,\{/g, "\"\}\,\{")
    tags_Structured = tags_Structured.replace(/^\"|\"$/g, '')

    for (var i = 0; i < schemas.length; i++) {
        RelationshipDS.push({name: "contain", uuid: uuid()});
        analysisDSRelationships.push({
            name: DSDatalake_postgre["name"] + " contain " + schemas[i]["name"],
            uuid: uuid()
        });
        hasRelationshipDS.push({
            analysisDSRelationship: analysisDSRelationships[analysisDSRelationships.length - 1]["uuid"],
            RelationshipDS: RelationshipDS[RelationshipDS.length - 1]["uuid"]
        })
        dlStructuredDatasets.push({name: schemas[i]["name"], uuid: uuid()});
        withDataset.push({
            analysisDSRelationship: analysisDSRelationships[analysisDSRelationships.length - 1]["uuid"],
            dlStructuredDataset: dlStructuredDatasets[dlStructuredDatasets.length - 1]["uuid"]
        })
        for (var j = 0; j < schemas[i]["entityClasses"].length; j++) {
            // console.log(schemas[i]["entityClasses"][j])
            entityClasses.push({
                name: schemas[i]["entityClasses"][j]["name"],
                comment: schemas[i]["entityClasses"][j]["comment"],
                numberOfAttributes: schemas[i]["entityClasses"][j]["numberOfAttributes"],
                numberOfInstances: schemas[i]["entityClasses"][j]["numberOfInstances"],
                numberOfInstancesWithMissingValues: schemas[i]["entityClasses"][j]["numberOfInstancesWithMissingValues"],
                numberOfMissingValues: schemas[i]["entityClasses"][j]["numberOfMissingValues"],
                numberOfNominalAttributes: schemas[i]["entityClasses"][j]["numberOfNominalAttributes"],
                numberOfNumericAttributes: schemas[i]["entityClasses"][j]["numberOfNumericAttributes"],
                uuid: uuid()
            });
            hasEntityClass.push({
                dlStructuredDataset: dlStructuredDatasets[dlStructuredDatasets.length - 1]["uuid"],
                entityClass:entityClasses[entityClasses.length -1]["uuid"]
            })
            //for numeric attributes
            for (var x = 0; x < schemas[i]["entityClasses"][j]["attributes"][0].length; x++) {
                // console.log(schemas[i]["entityClasses"][j]["attributes"][0][x])
                numericAttributes.push({
                    name: schemas[i]["entityClasses"][j]["attributes"][0][x]["name"],
                    type: schemas[i]["entityClasses"][j]["attributes"][0][x]["type"],
                    missingValuesCount: schemas[i]["entityClasses"][j]["attributes"][0][x]["missingValuesCount"],
                    min: schemas[i]["entityClasses"][j]["attributes"][0][x]["min"],
                    max: schemas[i]["entityClasses"][j]["attributes"][0][x]["max"],
                    uuid: uuid()
                })
                hasAttribute.push({
                    entityClass:entityClasses[entityClasses.length -1]["uuid"],
                    attributes:numericAttributes[numericAttributes.length -1]["uuid"]
                })
            }
            //for nominal attributes
            for (var y = 0; y < schemas[i]["entityClasses"][j]["attributes"][1].length; y++) {
                nominalAttributes.push({
                    name: schemas[i]["entityClasses"][j]["attributes"][1][y]["name"],
                    type: schemas[i]["entityClasses"][j]["attributes"][1][y]["type"],
                    missingValuesCount: schemas[i]["entityClasses"][j]["attributes"][1][y]["missingValuesCount"],
                    uuid: uuid()
                })
                hasAttribute.push({
                    entityClass:entityClasses[entityClasses.length -1]["uuid"],
                    attributes:nominalAttributes[nominalAttributes.length -1]["uuid"]
                })
            }
        }
    }
}

//When the insert into Neo4j is finished, reload this page
function reload() {
    location.reload();
}

//Call function Neo4jApi for insert
function insertNeo4jNoeud(analysisDSRelationships, RelationshipDS, dlStructuredDatasets, entityClasses, numericAttributes, nominalAttributes) {
    // console.log(DSDatalake_postgre)
    apineo4j.createDSIngestDSDLECStructured(DatasetSource_postgre, Ingest_postgre, DSDatalake_postgre);
    apineo4j.createTags(tags_Structured);
    apineo4j.createAnalysisDSRelationships(analysisDSRelationships);
    apineo4j.createRelationshipDS(RelationshipDS);
    apineo4j.createDLDSSchemas(dlStructuredDatasets);
    apineo4j.createEntityClasses(entityClasses);
    apineo4j.createNominalAttributs(numericAttributes);
    apineo4j.createNumericAttributs(nominalAttributes);
}

//Call function Neo4jApi for insert
function insertNeo4jRelationships(hasRelationshipDS,withDataset,hasEntityClass,hasAttribute) {
    apineo4j.createHasTagStructured(DSDatalake_postgre, tags_Structured);
    apineo4j.createHasRelationshipDS(hasRelationshipDS);
    apineo4j.createWithDataset(withDataset);
    apineo4j.createWithDatasetDB(withDataset,DSDatalake_postgre);
    apineo4j.createHasEntityClassStructured(hasEntityClass);
    apineo4j.createHasAttributeStructured(hasAttribute).then(p =>{
        var s1 = new Date(p).getTime(),s2 = start.getTime();
        var total = (s1-s2)/1000;
        document.getElementById("resultInsert").innerText="Completed, it took "+total +" s"
        document.getElementById("reload").style.display="block"

        // var day = parseInt(total / (24*60*60));//Calculate integer days
        // var afterDay = total - day*24*60*60;//Get the number of seconds remaining after calculating the number of days
        // var hour = parseInt(afterDay/(60*60));//Calculate whole number of hours
        // var afterHour = total - day*24*60*60 - hour*60*60;//Get the number of seconds remaining after calculating the number of hours
        // var min = parseInt(afterHour/60);//Calculate whole minutes
        // var afterMin = total - day*24*60*60 - hour*60*60 - min*60;//Get the number of seconds remaining after calculating the number of minutes
    });
}
