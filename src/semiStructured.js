const api = require("../neo4jApi");
const _ = require('lodash')
/* _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ UPLOAD _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _*/

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById('add').addEventListener("click", addTag);
  document.getElementById('ingestMode').addEventListener("change", showIngestMode);
  //document.getElementById('delete').addEventListener("click",affTagTest);
  document.getElementById("zone0").addEventListener("input", printTags);
  document.getElementById('fileInput').addEventListener('change', selectedFileChanged);
  document.getElementById('submitFile').addEventListener('click',analyseCSV);
  document.getElementById('confirmBtn').addEventListener('click',confirmInsert);
  document.getElementById('reloadUpload').addEventListener('click',reload);

});

//some variable used in all function
var today = new Date();
var delimiter = ",";
var NumberTags = 0;
var fileExtName =""
var fileContent = "";
var columns = [];
var rows = [];
var entityClass_CSV = {};
var attributesNumeric_CSV = [];
var attributesNominal_CSV = [];
var tags_CSV = [];
var DatasetSource_CSV = {};
var DSDatalake_CSV = {};
var Ingest_CSV = {};
var start = ""

//The ingest start time and end time is before today
window.onload = setMaxDate();
function setMaxDate() {
  getToday()
  document.getElementById("ingestionStartTime").setAttribute("max", today);
  document.getElementById("ingestionEndTime").setAttribute("max", today);
}

//If ingest Mode is batch , don't need ingest start time or end time
function showIngestMode() {
  var elt = document.getElementById("ingestMode");
  var select = elt.value;
  if (select == "batch") {
    document.getElementById("ingestionTime").style.display = "none";
  } else {
    document.getElementById("ingestionTime").style.display = "";
  }
}

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
  DatasetSource_CSV["owner"] = document.getElementById("owner").value
  DatasetSource_CSV["location"] = document.getElementById("urlDS").value
}

//set file upload and name,type of datasource
function selectedFileChanged() {
  if (this.files.length === 0) {
    console.log('please change！');
    return;
  }
  const reader = new FileReader();
  reader.onload = function fileReadCompleted() {
    fileContent = reader.result;
  };
  reader.readAsText(this.files[0]);
  document.getElementById("fileNameUpload").innerText=this.files[0].name
  console.log(this.files[0])
  DSDatalake_CSV["size"] = this.files[0].size+"B"
  var index= this.files[0].name.lastIndexOf(".");
  var fileName = this.files[0].name.substr(0,index);
  fileExtName = this.files[0].name.substr(index + 1, this.files[0].name.length);
  entityClass_CSV["name"] = fileName
  DatasetSource_CSV["name"] = fileName
  DatasetSource_CSV["type"] = setTypeDS(fileExtName)
}

//get type of dataset source
function setTypeDS(fileExtName){
  var type = "";
  if(fileExtName === "csv" || fileExtName==="txt") {
    type = "Semi-Structured dataset";
  }else if(fileExtName === "jpg" || fileExtName === "png") {
    type = "Unstructured dataset";
  }else if (fileExtName === "sql") {
    type = "Structured dataset";
  }
  return type;
}

function setDelimiter(){
  var checkedSwith =document.getElementById("delimiter").checked
  if(checkedSwith===true){
    delimiter=","
  }else{
    delimiter=";"
  }
}

//Split the contents of the CSV file into rows and columns
function splitCSV(fileContent){
  numberLigne = fileContent.split("\n").length - 1
  contentLigne = fileContent.split("\n")
  for (i=0 ; i<=numberLigne-1; i++){
    // var row = contentLigne[i].trim().split(",(?=([^\\\"]*\\\"[^\\\"]*\\\")*[^\\\"]*$)",-1)
    var row = contentLigne[i].trim().split(delimiter)
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
}

//set attributes of a column
function setAttributes(columns){
  for( var i = 0; i<columns.length;i++){
    var attribut = {};
    attribut["name"]=columns[i][0]
    attribut["missingValuesCount"]=countMissingValue(columns[i])
    attribut["type"]=getType(columns[i])
    if (attribut["type"]=="Numeric"){
      attribut["min"]=getMinColumn(columns[i])
      attribut["max"]=getMaxColumn(columns[i])
      attributesNumeric_CSV.push(attribut)
    }else{
      attributesNominal_CSV.push(attribut)
    }
  }
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

//get type of data of a column
function getType(column){
  var n = 0
  var d = 0
  for (i=1;i<column.length;i++) {
    // console.log(typeof column[i])
    if(isNaN(column[i])&&!isNaN(Date.parse(column[i]))){
      d=d+1
    }
    if(!isNaN(Number(column[i]))){
      n=n+1
    }
  }
  if(n==column.length-1){
    return "Numeric"
  }else{
    if(d==column.length-1){
      return "Date"
    }else{
      return "Varchar"
    }
  }
}

//set attributes of a entity class
function setEntityClass(attributesNumeric_CSV,attributesNominal_CSV,rows,columns){
  entityClass_CSV["numberOfAttributes"] = columns.length
  entityClass_CSV["numberOfInstances"] = rows.length -1
  entityClass_CSV["numberOfNumericAttributes"] = attributesNumeric_CSV.length
  entityClass_CSV["numberOfNominalAttributes"] = attributesNominal_CSV.length
  entityClass_CSV["numberOfInstancesWithMissingValues"] = countInstancesWithMissingValuesEC(rows)
  entityClass_CSV["numberOfMissingValues"] = countMissingValueEC(attributesNumeric_CSV) + countMissingValueEC(attributesNominal_CSV)
}

//count missing value of a entity class
function countMissingValueEC(attributes_CSV){
  var numberMissingValueEC=0
  for(i=0;i<attributes_CSV.length;i++){
    numberMissingValueEC = attributes_CSV[i]["missingValuesCount"] + numberMissingValueEC
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

//set the ingest start time and end time form the html page
function setIngest(){
  Ingest_CSV["ingestionMode"] = document.getElementById("ingestMode").value
  if(document.getElementById("ingestMode").value === "real-time"){
    Ingest_CSV["ingestionStartTime"] = document.getElementById("ingestionStartTime").value +":00Z"
    Ingest_CSV["ingestionEndTime"] = document.getElementById("ingestionEndTime").value +":00Z"
  }else {
    Ingest_CSV["ingestionStartTime"] = ""
    Ingest_CSV["ingestionEndTime"] = ""
  }
}

//set tags from the page html
function setTags(){
  var lengthTags = document.getElementsByName("tagsUsers").length
  for (i = 0; i<lengthTags; i++){
    var tag = {};
    tag["name"] = document.getElementsByName("tagsUsers")[i].value
    tags_CSV.push(tag)
  }
}

//set the content of datalakedataset
function setDSDatalake(){
  DSDatalake_CSV["owner"] = DatasetSource_CSV["owner"]
  DSDatalake_CSV["location"] = DatasetSource_CSV["location"]
  DSDatalake_CSV["name"] = DatasetSource_CSV["name"]
  DSDatalake_CSV["type"] = DatasetSource_CSV["type"]
  DSDatalake_CSV["filenameExtension"] = fileExtName
  DSDatalake_CSV["creationDate"] = today +":00Z"
  DSDatalake_CSV["description"] = document.getElementById("description").value
  DSDatalake_CSV["connectionURL"] = document.getElementById("urlDS").value
  DSDatalake_CSV["administrator"] = document.getElementById("admin").value
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
  today = yyyy + '-' + mm + '-' + dd + 'T' + hh + ':' + minute;
}

//When click Send, collect all datas in page and call function to insert in BD
function analyseCSV(){
  if (fileExtName === "csv"){
    setDelimiter()
    /*console.log("delimiter")
    console.log(delimiter)*/
    splitCSV(fileContent)
    setAttributes(columns)
    setEntityClass(attributesNumeric_CSV,attributesNominal_CSV,rows,columns)
    setTags();
    setDatasetSource();
    setDSDatalake();
    setIngest();
    attributesNumeric_CSV = JSON.stringify(attributesNumeric_CSV).replace(/\"/g, "")
    attributesNumeric_CSV = JSON.stringify(attributesNumeric_CSV).replace(/\:/g,"\:\"").replace(/\,/g,"\"\,").replace(/\}\]/g,"\"\}\]").replace(/\}\"\,\{/g,"\"\}\,\{")
    attributesNumeric_CSV = attributesNumeric_CSV.replace(/^\"|\"$/g,'')

    attributesNominal_CSV = JSON.stringify(attributesNominal_CSV).replace(/\"/g, "")
    attributesNominal_CSV = JSON.stringify(attributesNominal_CSV).replace(/\:/g,"\:\"").replace(/\,/g,"\"\,").replace(/\}\]/g,"\"\}\]").replace(/\}\"\,\{/g,"\"\}\,\{")
    attributesNominal_CSV = attributesNominal_CSV.replace(/^\"|\"$/g,'')

    tags_CSV = JSON.stringify(tags_CSV).replace(/\"/g, "")
    tags_CSV = JSON.stringify(tags_CSV).replace(/\:/g,"\:\"").replace(/\,/g,"\"\,").replace(/\}\]/g,"\"\}\]").replace(/\}\"\,\{/g,"\"\}\,\{")
    tags_CSV = tags_CSV.replace(/^\"|\"$/g,'')

    console.log("---------")
    console.log(fileContent)
    console.log(columns)
    console.log(rows)
    console.log(entityClass_CSV)
    console.log(attributesNumeric_CSV)
    console.log(attributesNominal_CSV)
    console.log(tags_CSV)
    console.log("---------")
  }
}

//Call function Neo4jApi for insert
function insertNeo4jNoeud(){
  api.createNominalAttributs(attributesNominal_CSV).catch(e => {
    document.getElementById("resultInsert").innerText= "Please check whether the csv file format or delimiter is correct"
  })
  api.createNumericAttributs(attributesNumeric_CSV).catch(e => {
    document.getElementById("resultInsert").innerText= "Please check whether the csv file format or delimiter is correct"
  })
  api.createDSIngestDSDLEC(DatasetSource_CSV,Ingest_CSV,DSDatalake_CSV,entityClass_CSV)
  api.createTags(tags_CSV)
}

//Call function Neo4jApi for insert
function insertNeo4jHasTag(){
  api.createHasTag(DSDatalake_CSV,tags_CSV)
}

//Call function Neo4jApi for insert
function insertNeo4jHasAttriibute(){

  api.createHasAttributeNumeric(entityClass_CSV,attributesNumeric_CSV)
  api.createHasAttributeNominal(entityClass_CSV,attributesNominal_CSV).then(p =>{
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
  })
}

function confirmInsert(){
  start = new Date();
  console.log(start)
  document.getElementById("waitingBox").style.display="block"
  document.getElementById("confirmSendBox").style.display="none"
  insertNeo4jNoeud();
  setTimeout(insertNeo4jHasTag,500)
  setTimeout(insertNeo4jHasAttriibute,500)
}

function reload(){
  location.reload();
}