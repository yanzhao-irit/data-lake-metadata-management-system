const api = require("../neo4jApi");
const _ = require('lodash')


$( "#dialog" ).dialog();
/* _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ UPLOAD _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _*/

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById('add').addEventListener("click", addTag);
  document.getElementById("zone0").addEventListener("input", printTags);
  document.getElementById('fileInput').addEventListener('change', selectedFileChanged);
  document.getElementById('submitFile').addEventListener('click',analyseCSV);
  document.getElementById('confirmBtn').addEventListener('click',confirmInsert);
  document.getElementById('reloadUpload').addEventListener('click',reload);

});

//some variable used in all function
var today = new Date();

var NumberTags = 0;
var fileExtName =""
var tags_UnStructured = [];
var DatasetSource_UnStructured = {};
var DSDatalake_UnStructured = {};
var Ingest_UnStructured = {};
var start = ""

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
  DatasetSource_UnStructured["owner"] = document.getElementById("owner").value
  DatasetSource_UnStructured["location"] = document.getElementById("urlDS").value
}

//set file upload and name,type of datasource
function selectedFileChanged() {
  if (this.files.length === 0) {
    console.log('please upload file！');
    return;
  }
  const reader = new FileReader();
  reader.readAsText(this.files[0]);
  document.getElementById("fileNameUpload").innerText=this.files[0].name
  console.log(this.files[0])
  DSDatalake_UnStructured["size"] = this.files[0].size+"B"
  var index= this.files[0].name.lastIndexOf(".");
  var fileName = this.files[0].name.substr(0,index);
  fileExtName = this.files[0].name.substr(index + 1, this.files[0].name.length);
  DatasetSource_UnStructured["name"] = fileName
  DatasetSource_UnStructured["type"] = setTypeDS(fileExtName)
  DSDatalake_UnStructured["format"] = setFormat(fileExtName)
}

//get type of dataset source
function setTypeDS(fileExtName){
  // console.log(fileExtName)
  var unstructuredExt = ["jpg","png","jpeg","ico","svg","gif","txt","docx","mp3","avi","mp4","bak","zip","pdf"]
  var type = "";
  if(fileExtName === "csv" || fileExtName==="json") {
    type = "Semi-Structured dataset";
  }else if(unstructuredExt.includes(fileExtName)) {
    type = "Unstructured dataset";
  }else if (fileExtName === "sql") {
    type = "Structured dataset";
  }
  return type;
}


//set the ingest start time and end time form the html page
function setIngest(){
  Ingest_UnStructured["ingestionMode"] = "batch"
  Ingest_UnStructured["ingestionStartTime"] = ""
  Ingest_UnStructured["ingestionEndTime"] = ""
}

//set tags from the page html
function setTags(){
  var lengthTags = document.getElementsByName("tagsUsers").length
  for (i = 0; i<lengthTags; i++){
    var tag = {};
    tag["name"] = document.getElementsByName("tagsUsers")[i].value
    tags_UnStructured.push(tag)
  }
}

//set the content of datalakedataset
function setDSDatalake(){
  DSDatalake_UnStructured["owner"] = DatasetSource_UnStructured["owner"]
  DSDatalake_UnStructured["location"] = DatasetSource_UnStructured["location"]
  DSDatalake_UnStructured["name"] = DatasetSource_UnStructured["name"]
  DSDatalake_UnStructured["type"] = DatasetSource_UnStructured["type"]
  DSDatalake_UnStructured["filenameExtension"] = fileExtName
  DSDatalake_UnStructured["creationDate"] = getToday() +":00Z"
  DSDatalake_UnStructured["description"] = document.getElementById("description").value
  DSDatalake_UnStructured["connectionURL"] = document.getElementById("urlDS").value
  DSDatalake_UnStructured["administrator"] = document.getElementById("admin").value
}

function setFormat(fileExtName){
  var imageFormat = ["jpg","png","jpeg","gif","ico","svg"]
  var textFormat = ["txt","docx"]
  var videoFormat = ["avi","mp4"]
  var audioFormat = ["mp3"]
  var backupFormat = ["bak"]
  var fileFormat = ["zip","pdf"]
  var unstructuredExt = {"image":imageFormat,"text":textFormat,"video":videoFormat,"audio":audioFormat,"backup":backupFormat,"file":fileFormat}
  var format = "";
  for (var key in unstructuredExt){
    if(unstructuredExt[key].includes(fileExtName)) {
      format = key;
    }
  }
  return format;
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
function analyseCSV(){
  if (DatasetSource_UnStructured["type"]==="Unstructured dataset"){
    setTags();
    setDatasetSource();
    setDSDatalake();
    setIngest();

    tags_UnStructured = JSON.stringify(tags_UnStructured).replace(/\"/g, "")
    tags_UnStructured = JSON.stringify(tags_UnStructured).replace(/\:/g,"\:\"").replace(/\,/g,"\"\,").replace(/\}\]/g,"\"\}\]").replace(/\}\"\,\{/g,"\"\}\,\{")
    tags_UnStructured = tags_UnStructured.replace(/^\"|\"$/g,'')

    console.log("---------")
    console.log(DatasetSource_UnStructured)
    console.log(Ingest_UnStructured)
    console.log(DSDatalake_UnStructured)
    console.log(tags_UnStructured)
    console.log("---------")
  }
}

//Call function Neo4jApi for insert
function insertNeo4jNoeud(){
  api.createDSIngestDSDLECUnStructured(DatasetSource_UnStructured,Ingest_UnStructured,DSDatalake_UnStructured)
  api.createTags(tags_UnStructured)
}

//Call function Neo4jApi for insert
function insertNeo4jHasTag(){
  api.createHasTagUnStructured(DSDatalake_UnStructured,tags_UnStructured).then(p =>{
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
}

function reload(){
  location.reload();
}