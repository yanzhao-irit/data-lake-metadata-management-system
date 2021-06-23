const api = require("../neo4jApi");
const _ = require('lodash')


$("#dialog").dialog();
// const api = require('./neo4jApi.js');
// const orcl = require('./oracleAPI');
// const toJsonSchema = require('to-json-schema');
// const path = require("path");
// const { api } = require(path.resolve('./contents/neo4jJs/neo4jApi'));

var listExeEnv = [];
var typeRecherche = [];
var typeOpe = [];
var langList = [];
var exeEnvList = [];
var landmarkerList = [];
var optionLandmarkerList = [];
var optionParameterList = [];
var parameterList = []
var optionEvaluationList = [];
var evaluationList = []
var optionEntityClass = [];
var entityClassList = [];
var dsDate = "0001-01-01T00:00:00Z";
var pDate = "0001-01-01";
var aDate = "0001-01-01";
var inputECAnames = "";
var algoNames = document.getElementById("algoNames");
var lastSelected;
var cypherHistoryList = [];
var graphListResult = [];
var similarityGraph = []
var betweennessGraph = []
var tagsinput = []
var trans = "";
var datasetChosed = []
var timer;

var options = {
  autoResize: true,
  nodes: {
    shape: "dot",
    size: 10,
  },
  edges: {
    color: 'gray',
    smooth: false,
    font: {
      size: 10,
    },
    arrows: 'to'
  },
  groups: {
    Process: {
      color: { background: "#00F5FF", border: "black" },
      // shape: "diamond",
    },
    Analysis: {
      color: { background: "#FFFACD", border: "black" },
      // shape: "diamond",
    },
    AlgoSupervised: {
      color: { background: "#FFE4B5", border: "black" },
      // shape: "diamond",
    },
    AnalysisAttribute: {
      color: { background: "#696969", border: "black" },
      // shape: "diamond",
    },
    AnalysisDSRelationship: {
      color: { background: "#708090", border: "black" },
      // shape: "diamond",
    },
    AnalysisFeatures: {
      color: { background: "#000080", border: "black" },
      // shape: "diamond",
    },
    AnalysisNominalFeatures: {
      color: { background: "#008B00", border: "black" },
      // shape: "diamond",
    },
    AnalysisNumericFeatures: {
      color: { background: "#EEDC82", border: "black" },
      // shape: "diamond",
    },
    AnalysisTarget: {
      color: { background: "#EEEE00", border: "black" },
      // shape: "diamond",
    },
    DLSemistructuredDataset: {
      color: { background: "#FFC1C1", border: "black" },
      // shape: "diamond",
    },
    DLStructuredDataset: {
      color: { background: "#8B658B", border: "black" },
      // shape: "diamond",
    },
    DLUnstructuredDataset: {
      color: { background: "#EE6363", border: "black" },
      // shape: "diamond",
    },
    DatasetSource: {
      color: { background: "#FFA500", border: "black" },
      // shape: "diamond",
    },
    EntityClass: {
      color: { background: "#DDA0DD", border: "black" },
      // shape: "diamond",
    },
    EvaluationMeasure: {
      color: { background: "#D8BFD8", border: "black" },
      // shape: "diamond",
    },
    Implementation: {
      color: { background: "#EE7600", border: "black" },
      // shape: "diamond",
    },
    Landmarker: {
      color: { background: "#EEDFCC", border: "black" },
      // shape: "diamond",
    },
    Ingest: {
      color: { background: "#8B8378", border: "black" },
      // shape: "diamond",
    },
    JobTitle: {
      color: { background: "#EE5C42", border: "black" },
      // shape: "diamond",
    },
    ModelEvaluation: {
      color: { background: "#8B3626", border: "black" },
      // shape: "diamond",
    },
    Tag: {
      color: { background: "#FF1493", border: "black" },
      // shape: "diamond",
    },
    RelationshipDS: {
      color: { background: "#00BFFF", border: "black" },
      // shape: "diamond",
    },
    RelationshipAtt: {
      color: { background: "#00688B", border: "black" },
      // shape: "diamond",
    },
    ParameterSetting: {
      color: { background: "#551A8B", border: "black" },
      // shape: "diamond",
    },
    Operation: {
      color: { background: "#1C1C1C", border: "black" },
      // shape: "diamond",
    },
    OperationOfProcess: {
      color: { background: "#BCD2EE", border: "black" },
      // shape: "diamond",
    },
    Parameter: {
      color: { background: "#008B8B", border: "black" },
      // shape: "diamond",
    },
    NominalAttribute: {
      color: { background: "#E0FFFF", border: "black" },
      // shape: "diamond",
    },
    NumericAttribute: {
      color: { background: "#D1EEEE", border: "black" },
      // shape: "diamond",
    },
    Study: {
      color: { background: "#7EC0EE", border: "black" },
      // shape: "diamond",
    },
  },
};


//Beginning of event listener
$(function () {
  //Initialisation of graphic interface
  usedOpeInit()
  var promisegraph = new Promise((resolve, reject) => {
    api.graphList().then(p => {
      graphListResult = p
      console.log(graphListResult)
      if (resolve !== undefined) {
        resolve();
      }
    })
  })
  promisegraph.then(() => {
    console.log(graphListResult)
    if (graphListResult.indexOf('graph-DDDT') == -1) {
      api.createGraph()
    }
    if (graphListResult.indexOf('graph-All') == -1) {
      api.createGraphAll()
    }
  })

  promisegraph.finally(() => {
    api.algoSimilairty().then(a => {
      similarityGraph = a
    })
    api.algoBetweennessCentrality().then(a => {
      betweennessGraph = a
    })
  })

  //Variable to stock tags input
  tagsinput = $('#tagsinput').tagsinput('items');

  //Function on itemAdded for each key words input
  $("#tagsinput").on('itemAdded', function (event) {
    console.log('item added : ' + event.item);
    console.log('tagsinput : ' + tagsinput)
    document.getElementById("EntityClassButtonDataset").style.display = 'none';
    document.getElementById("EntityClassButtonAnalyse").style.display = 'none';

    //For each new keywords added, it reinitialize the interface to show the three search table and it hide the graphic interface.
    $("#processNames").closest(".collapse").collapse('show');
    $("#dbNames").closest(".collapse").collapse('show');
    $("#analyseNames").closest(".collapse").collapse('show');
    $('#graphco').collapse('hide');
    //Clean column to let the new results appear from the query (dataset, process, analyse)
    $(".names").empty()
    //refresh graphic interface
    //Call for search functions with inputs
    showProcesses(tagsinput, langList, pDate, typeOpe, exeEnvList);
    showStudies(tagsinput, typeRecherche, aDate, landmarkerList, algoNames.value, parameterList, evaluationList);
    showDatabases(tagsinput, typeRecherche, dsDate, "", "", inputECAnames);
    //Init filters that need database request
    languageProcessInit(tagsinput)
    excutionEnvironmentInit(tagsinput)
    //Clean others interfaces to reset if there was a precedent research
    $(".analyse").empty();
    $("#EntityClassNames").empty()
  });

  //Same if a input tags is removed
  $("#tagsinput").on('itemRemoved', function (event) {
    console.log('item removed : ' + event.item);
    console.log('tagsinput : ' + tagsinput)
    document.getElementById("EntityClassButtonDataset").style.display = 'none';
    document.getElementById("EntityClassButtonAnalyse").style.display = 'none';
    $("#processNames").closest(".collapse").collapse('show');
    $("#dbNames").closest(".collapse").collapse('show');
    $("#analyseNames").closest(".collapse").collapse('show');
    $('#graphco').collapse('hide');
    if (!tagsinput.length == 0) {
      $(".names").empty()
      showProcesses(tagsinput, langList, pDate, typeOpe, exeEnvList);
      showStudies(tagsinput, typeRecherche, aDate, landmarkerList, algoNames.value, parameterList, evaluationList);
      showDatabases(tagsinput, typeRecherche, dsDate, "", "", inputECAnames);
      languageProcessInit(tagsinput, langList, pDate, typeOpe)
      excutionEnvironmentInit(tagsinput)
      $(".analyse").empty();
      $("#EntityClassNames").empty()
    }
    else {
      $(".names").empty();
    }
  });

  $('#sortDataset').on('click', function () {
    var listChild = $('#dbNames').children().toArray()
    if ($(this).text() == 'Importance') {
      listChild.sort((a, b) => {
        var textA = a.innerText.toUpperCase();
        var textB = b.innerText.toUpperCase();
        return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
      })
      listChild.forEach(a => {
        $('#dbNames').append(a)
      })
      $(this).text('Name')
    } else {
      listChild.sort((a, b) => {
        var textA = _.findIndex(betweennessGraph, function (el) { return el[0] == a.innerText; });
        var textB = _.findIndex(betweennessGraph, function (el) { return el[0] == b.innerText; });
        return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
      })
      listChild.forEach(a => {
        $('#dbNames').append(a)
      })
      $(this).text('Importance')
    }
  })

  //Function onclick to go back to the search table from the graphic interface.
  $('#back').on('click', function () {
    document.getElementById("EntityClassButtonAnalyse").style.display = 'none';
    document.getElementById("EntityClassButtonDataset").style.display = 'none';
    $("#processNames").closest(".collapse").collapse('show');
    $("#dbNames").closest(".collapse").collapse('show');
    $("#analyseNames").closest(".collapse").collapse('show');
    $("#graphco").collapse('hide');
    $(".analyse").empty();
    $("#EntityClassNames").empty()
  });

  $('#submitCypherRequest').on('click', function () {
    $('#cypherHistory').empty()
    cypherHistoryList.unshift($('#cypherrequest').val());
    query6 = $('#cypherrequest').val()
    api.getGraph(query6).then(result => {
      var nodes = new vis.DataSet(result[result.length - 1][0])
      var edges = new vis.DataSet(result[result.length - 1][1])
      var container = document.getElementById('viz6')
      var data = { nodes: nodes, edges: edges };
      var options = {
        autoResize: true,
        nodes: {
          shape: "dot",
          size: 30,
          font: {
            size: 10,
          },
        },
        edges: {
          color: 'gray',
          smooth: false,
          font: {
            size: 10,
          },
          arrows: 'to'
        },
        interaction: {
          hover: true
        },
        groups: {
          Process: {
            color: { background: "#00F5FF", border: "black" },
            // shape: "diamond",
          },
          Analysis: {
            color: { background: "#FFFACD", border: "black" },
            // shape: "diamond",
          },
          AlgoSupervised: {
            color: { background: "#FFE4B5", border: "black" },
            // shape: "diamond",
          },
          AnalysisAttribute: {
            color: { background: "#696969", border: "black" },
            // shape: "diamond",
          },
          AnalysisDSRelationship: {
            color: { background: "#708090", border: "black" },
            // shape: "diamond",
          },
          AnalysisFeatures: {
            color: { background: "#000080", border: "black" },
            // shape: "diamond",
          },
          AnalysisNominalFeatures: {
            color: { background: "#008B00", border: "black" },
            // shape: "diamond",
          },
          AnalysisNumericFeatures: {
            color: { background: "#EEDC82", border: "black" },
            // shape: "diamond",
          },
          AnalysisTarget: {
            color: { background: "#EEEE00", border: "black" },
            // shape: "diamond",
          },
          DLSemistructuredDataset: {
            color: { background: "#FFC1C1", border: "black" },
            // shape: "diamond",
          },
          DLStructuredDataset: {
            color: { background: "#8B658B", border: "black" },
            // shape: "diamond",
          },
          DLUnstructuredDataset: {
            color: { background: "#EE6363", border: "black" },
            // shape: "diamond",
          },
          DatasetSource: {
            color: { background: "#FFA500", border: "black" },
            // shape: "diamond",
          },
          EntityClass: {
            color: { background: "#DDA0DD", border: "black" },
            // shape: "diamond",
          },
          EvaluationMeasure: {
            color: { background: "#D8BFD8", border: "black" },
            // shape: "diamond",
          },
          Implementation: {
            color: { background: "#EE7600", border: "black" },
            // shape: "diamond",
          },
          Landmarker: {
            color: { background: "#EEDFCC", border: "black" },
            // shape: "diamond",
          },
          Ingest: {
            color: { background: "#8B8378", border: "black" },
            // shape: "diamond",
          },
          JobTitle: {
            color: { background: "#EE5C42", border: "black" },
            // shape: "diamond",
          },
          ModelEvaluation: {
            color: { background: "#8B3626", border: "black" },
            // shape: "diamond",
          },
          Tag: {
            color: { background: "#FF1493", border: "black" },
            // shape: "diamond",
          },
          RelationshipDS: {
            color: { background: "#00BFFF", border: "black" },
            // shape: "diamond",
          },
          RelationshipAtt: {
            color: { background: "#00688B", border: "black" },
            // shape: "diamond",
          },
          ParameterSetting: {
            color: { background: "#551A8B", border: "black" },
            // shape: "diamond",
          },
          Operation: {
            color: { background: "#1C1C1C", border: "black" },
            // shape: "diamond",
          },
          OperationOfProcess: {
            color: { background: "#BCD2EE", border: "black" },
            // shape: "diamond",
          },
          Parameter: {
            color: { background: "#008B8B", border: "black" },
            // shape: "diamond",
          },
          NominalAttribute: {
            color: { background: "#E0FFFF", border: "black" },
            // shape: "diamond",
          },
          NumericAttribute: {
            color: { background: "#D1EEEE", border: "black" },
            // shape: "diamond",
          },
          Study: {
            color: { background: "#7EC0EE", border: "black" },
            // shape: "diamond",
          },
        }
      };
      var network = new vis.Network(container, data, options);
      network.body.emitter.emit('_dataChanged')
      network.redraw()
      network.fit()
    })
    for (var i = 0; i < Math.min(10, cypherHistoryList.length); i++) {
      $('#cypherHistory').append($("<tr class='cypherRequestHistory'><td>" + cypherHistoryList[i] + "</td></tr>"))
    }
    $('#cypherrequest').val('');
  });

  $('#cypherHistory').on('click', "td", function () {
    $('#cypherrequest').val($(this).text())
    query6 = $(this).text()
    api.getGraph(query6).then(result => {
      var nodes = new vis.DataSet(result[result.length - 1][0])
      var edges = new vis.DataSet(result[result.length - 1][1])
      var container = document.getElementById('viz6')
      var data = { nodes: nodes, edges: edges };
      var options = {
        autoResize: true,
        nodes: {
          shape: "dot",
          size: 30,
          font: {
            size: 10,
          },
        },
        edges: {
          color: 'gray',
          smooth: false,
          font: {
            size: 10,
          },
          arrows: 'to'
        },
        groups: {
          Process: {
            color: { background: "#00F5FF", border: "black" },
            // shape: "diamond",
          },
          Analysis: {
            color: { background: "#FFFACD", border: "black" },
            // shape: "diamond",
          },
          AlgoSupervised: {
            color: { background: "#FFE4B5", border: "black" },
            // shape: "diamond",
          },
          AnalysisAttribute: {
            color: { background: "#696969", border: "black" },
            // shape: "diamond",
          },
          AnalysisDSRelationship: {
            color: { background: "#708090", border: "black" },
            // shape: "diamond",
          },
          AnalysisFeatures: {
            color: { background: "#000080", border: "black" },
            // shape: "diamond",
          },
          AnalysisNominalFeatures: {
            color: { background: "#008B00", border: "black" },
            // shape: "diamond",
          },
          AnalysisNumericFeatures: {
            color: { background: "#EEDC82", border: "black" },
            // shape: "diamond",
          },
          AnalysisTarget: {
            color: { background: "#EEEE00", border: "black" },
            // shape: "diamond",
          },
          DLSemistructuredDataset: {
            color: { background: "#FFC1C1", border: "black" },
            // shape: "diamond",
          },
          DLStructuredDataset: {
            color: { background: "#8B658B", border: "black" },
            // shape: "diamond",
          },
          DLUnstructuredDataset: {
            color: { background: "#EE6363", border: "black" },
            // shape: "diamond",
          },
          DatasetSource: {
            color: { background: "#FFA500", border: "black" },
            // shape: "diamond",
          },
          EntityClass: {
            color: { background: "#DDA0DD", border: "black" },
            // shape: "diamond",
          },
          EvaluationMeasure: {
            color: { background: "#D8BFD8", border: "black" },
            // shape: "diamond",
          },
          Implementation: {
            color: { background: "#EE7600", border: "black" },
            // shape: "diamond",
          },
          Landmarker: {
            color: { background: "#EEDFCC", border: "black" },
            // shape: "diamond",
          },
          Ingest: {
            color: { background: "#8B8378", border: "black" },
            // shape: "diamond",
          },
          JobTitle: {
            color: { background: "#EE5C42", border: "black" },
            // shape: "diamond",
          },
          ModelEvaluation: {
            color: { background: "#8B3626", border: "black" },
            // shape: "diamond",
          },
          Tag: {
            color: { background: "#FF1493", border: "black" },
            // shape: "diamond",
          },
          RelationshipDS: {
            color: { background: "#00BFFF", border: "black" },
            // shape: "diamond",
          },
          RelationshipAtt: {
            color: { background: "#00688B", border: "black" },
            // shape: "diamond",
          },
          ParameterSetting: {
            color: { background: "#551A8B", border: "black" },
            // shape: "diamond",
          },
          Operation: {
            color: { background: "#1C1C1C", border: "black" },
            // shape: "diamond",
          },
          OperationOfProcess: {
            color: { background: "#BCD2EE", border: "black" },
            // shape: "diamond",
          },
          Parameter: {
            color: { background: "#008B8B", border: "black" },
            // shape: "diamond",
          },
          NominalAttribute: {
            color: { background: "#E0FFFF", border: "black" },
            // shape: "diamond",
          },
          NumericAttribute: {
            color: { background: "#D1EEEE", border: "black" },
            // shape: "diamond",
          },
          Study: {
            color: { background: "#7EC0EE", border: "black" },
            // shape: "diamond",
          },
        }
      };
      var network = new vis.Network(container, data, options);
      network.body.emitter.emit('_dataChanged')
      network.redraw()
      network.fit()
    })
  });

  $('#switchSearchMod').on('click', function () {
    var display = $('#filter')[0].style.display;
    var display2 = $('#specificSearch')[0].style.display;
    var display3 = $('#mainSearch')[0].style.display;
    if (display === "none") {
      $('#filter')[0].style.display = "block";
      $(this).html("Advanced Cypher Request");
    } else {
      $(this).html("Main Search");
      $('#filter')[0].style.display = "none";
    }
    if (display2 === "none") {
      $('#specificSearch')[0].style.display = "block";
    } else {
      $('#specificSearch')[0].style.display = "none";
    }
    if (display3 === "none") {
      $('#mainSearch')[0].style.display = "block";
    } else {
      $('#mainSearch')[0].style.display = "none";
    }
  })

  //Function onlick on attributes and entityclass interface to show their properties
  $('.attNames').on('click', "td", function () {
    //Clean the precedent list of items
    $('#relationshipOnglet').empty()
    $('#relationshipContent').empty()
    //Check if the target is a attribute or an entity class
    if ($(this)[0].className == "Attribute") {
      //Clean the properties windows if a precedent items has been clicked.
      $('#attrProperties').empty()
      //Check if the attributes is numeric or nominal
      if ($(this).attr('id').split('$')[2] = 'nominale') {
        //Call of a function to get database result
        api.getNominalAttribute($(this).attr('id').split('$')[0], $(this).attr('id').split('$')[1]).then(a => {
          //Transform the result format to JSON to have an easier access to informations
          json = JSON.parse(JSON.stringify(a[0]))
          //Get the properties windows emplacement
          $list = $('#attrProperties')

          let arr = [];
          for (propriete in a[0]) {
            arr.push(propriete);
          }
          arr.sort();
          for (var i in arr) {
            if (arr[i] === "name") {
              $list.prepend("<p style='word-wrap:break-word'>" + arr[i] + ":" + a[0][arr[i]] + "</p>");
            } else {
              $list.append("<p style='word-wrap:break-word'>" + arr[i] + ":" + a[0][arr[i]] + "</p>");
            }
          }

        })
      }
      //If numeric attribute
      if ($(this).attr('id').split('$')[2] = 'numeric') {
        api.getNumericAttribute($(this).attr('id').split('$')[0], $(this).attr('id').split('$')[1]).then(a => {
          json = JSON.parse(JSON.stringify(a[0]))
          $list = $('#attrProperties')

          let arr = [];
          for (propriete in a[0]) {
            arr.push(propriete);
          }
          arr.sort();
          for (var i in arr) {
            if (arr[i] === "name") {
              $list.prepend("<p style='word-wrap:break-word'>" + arr[i] + ":" + a[0][arr[i]] + "</p>");
            } else {
              $list.append("<p style='word-wrap:break-word'>" + arr[i] + ":" + a[0][arr[i]] + "</p>");
            }
          }

        })
      }
    }

    //if the target is an entity class
    if ($(this)[0].className == 'EntityClass') {
      $('#EntityClassProperties').empty()
      //Call of a database fucntion to get entity class by analysis
      api.getEntityClassByAnalyse($(this).attr('id').split('$')[2], $(this).attr('id').split('$')[1]).then(ec => {
        json = JSON.parse(JSON.stringify(ec[0]))
        $list = $('#EntityClassProperties')

        let arr = [];
        for (propriete in ec[0]) {
          arr.push(propriete);
        }
        arr.sort();
        for (var i in arr) {
          if (arr[i] === "name") {
            $list.prepend("<p style='word-wrap:break-word'>" + arr[i] + ":" + ec[0][arr[i]] + "</p>");
          } else {
            $list.append("<p style='word-wrap:break-word'>" + arr[i] + ":" + ec[0][arr[i]] + "</p>");
          }
        }
      })
      //or by dataset
      api.getEntityClassByDataset($(this).attr('id').split('$')[0], $(this).attr('id').split('$')[1], $(this).attr('id').split('$')[2]).then(ec => {
        json = JSON.parse(JSON.stringify(ec[0]))
        $list = $('#EntityClassProperties')


        let arr = [];
        for (propriete in ec[0]) {
          arr.push(propriete);
        }
        arr.sort();
        let str = '';
        for (var i in arr) {
          if (arr[i] === "name") {
            $list.prepend("<p style='word-wrap:break-word'>" + arr[i] + ":" + ec[0][arr[i]] + "</p>");
          } else {
            $list.append("<p style='word-wrap:break-word'>" + arr[i] + ":" + ec[0][arr[i]] + "</p>");
          }

        }
      })
    }
  })

  //Onlick function for the three tables (dataset, process, analyses)
  $('.names').on('click', "td", function () {
    //To change the color of the element clicked to know which one is clicked
    $(this)[0].style.backgroundColor = '#93e2df'
    if (lastSelected) {
      lastSelected[0].style.backgroundColor = ''
    }
    lastSelected = $(this)

    //When we click on an element, we hide all the tables to only show the table of the element and the graphic interface
    $('.collapse').collapse('hide');
    //The set time out allow to wait for the collapse element to end their changement bootstrap collapse have 3 state (collapse <-> collapsing <-> collapse in)
    setTimeout(() => { $('#graphco').collapse('show'); }, 500);
    //Clean the properties window
    $("#properties").empty()

    //check which element is clicked
    console.log($(this)[0].className)
    if ($(this)[0].className == "Process") {
      //Hide unused tabs
      $('#featureButton')[0].style.display = 'none';
      $('#dsRelationButton')[0].style.display = 'none';
      $('#attRelationButton')[0].style.display = 'none';
      $('#operationButton')[0].style.display = 'block';
      $('#similarityButton')[0].style.display = 'none';

      //Get information of the process clicked
      api
        .getProcesses([$(this).text()])
        .then(p => {
          if (p) {
            json = JSON.parse(JSON.stringify(p[0]))
            var $p = $("#properties")
            for (propriete in p[0]) {
              if (propriete == "executionDate" || propriete == 'id') {
                $p.append("<p>" + propriete + " : " + json[propriete].low + "</p>");
              } else {
                $p.append("<p>" + propriete + " : " + json[propriete] + "</p>");
              }
            }
          }
        }, "json");

      //Graph variable
      //query is for lineage
      //query2 is for hyper-graph
      //query3 is for Operation
      query = `MATCH path =(m)<-[:targetData]-(c:Process {uuid:'` + $(this).attr('id').split('$')[1] + `'})<-[:sourceData]-(d) 
      OPTIONAL MATCH (c)<-[q:hasSubprocess]-(w: Process) 
      RETURN path,w,q
      UNION ALL
      MATCH path2=((dl)-[]-(i:Ingest)-[]-(p:Process {uuid:'`+ $(this).attr('id').split('$')[1] + `'})-[]-(d:DatasetSource)-[]-(sos:SourceOfSteam))
      WHERE (dl:DLStructuredDataset OR dl:DLSemistructuredDataset OR dl:DLUnstructuredDataset)
      RETURN path2 AS path, null as w, null as q`; //Process
      api.getGraph(query).then(result => {
        var nodes = new vis.DataSet(result[result.length - 1][0])
        var edges = new vis.DataSet(result[result.length - 1][1])
        var container = document.getElementById('viz')
        var data = { nodes: nodes, edges: edges };
        var options = {
          autoResize: true,
          nodes: {
            shape: "dot",
            size: 30,
            font: {
              size: 10,
            },

          },
          edges: {
            color: 'gray',
            smooth: false,
            font: {
              size: 10,
            },
            arrows: 'to'
          },
          layout: {
            hierarchical: {
              direction: "LR",
            },
          },
          groups: {
            Process: {
              color: { background: "#00F5FF", border: "black" },
              // shape: "diamond",
            },
            Analysis: {
              color: { background: "#FFFACD", border: "black" },
              // shape: "diamond",
            },
            AlgoSupervised: {
              color: { background: "#FFE4B5", border: "black" },
              // shape: "diamond",
            },
            AnalysisAttribute: {
              color: { background: "#696969", border: "black" },
              // shape: "diamond",
            },
            AnalysisDSRelationship: {
              color: { background: "#708090", border: "black" },
              // shape: "diamond",
            },
            AnalysisFeatures: {
              color: { background: "#000080", border: "black" },
              // shape: "diamond",
            },
            AnalysisNominalFeatures: {
              color: { background: "#008B00", border: "black" },
              // shape: "diamond",
            },
            AnalysisNumericFeatures: {
              color: { background: "#EEDC82", border: "black" },
              // shape: "diamond",
            },
            AnalysisTarget: {
              color: { background: "#EEEE00", border: "black" },
              // shape: "diamond",
            },
            DLSemistructuredDataset: {
              color: { background: "#FFC1C1", border: "black" },
              // shape: "diamond",
            },
            DLStructuredDataset: {
              color: { background: "#8B658B", border: "black" },
              // shape: "diamond",
            },
            DLUnstructuredDataset: {
              color: { background: "#EE6363", border: "black" },
              // shape: "diamond",
            },
            DatasetSource: {
              color: { background: "#FFA500", border: "black" },
              // shape: "diamond",
            },
            EntityClass: {
              color: { background: "#DDA0DD", border: "black" },
              // shape: "diamond",
            },
            EvaluationMeasure: {
              color: { background: "#D8BFD8", border: "black" },
              // shape: "diamond",
            },
            Implementation: {
              color: { background: "#EE7600", border: "black" },
              // shape: "diamond",
            },
            Landmarker: {
              color: { background: "#EEDFCC", border: "black" },
              // shape: "diamond",
            },
            Ingest: {
              color: { background: "#8B8378", border: "black" },
              // shape: "diamond",
            },
            JobTitle: {
              color: { background: "#EE5C42", border: "black" },
              // shape: "diamond",
            },
            ModelEvaluation: {
              color: { background: "#8B3626", border: "black" },
              // shape: "diamond",
            },
            Tag: {
              color: { background: "#FF1493", border: "black" },
              // shape: "diamond",
            },
            RelationshipDS: {
              color: { background: "#00BFFF", border: "black" },
              // shape: "diamond",
            },
            RelationshipAtt: {
              color: { background: "#00688B", border: "black" },
              // shape: "diamond",
            },
            ParameterSetting: {
              color: { background: "#551A8B", border: "black" },
              // shape: "diamond",
            },
            Operation: {
              color: { background: "#1C1C1C", border: "black" },
              // shape: "diamond",
            },
            OperationOfProcess: {
              color: { background: "#BCD2EE", border: "black" },
              // shape: "diamond",
            },
            Parameter: {
              color: { background: "#008B8B", border: "black" },
              // shape: "diamond",
            },
            NominalAttribute: {
              color: { background: "#E0FFFF", border: "black" },
              // shape: "diamond",
            },
            NumericAttribute: {
              color: { background: "#D1EEEE", border: "black" },
              // shape: "diamond",
            },
            Study: {
              color: { background: "#7EC0EE", border: "black" },
              // shape: "diamond",
            },
          }
        };
        var network = new vis.Network(container, data, options);
        network.body.emitter.emit('_dataChanged')
        network.redraw()
        network.fit()
      })
      query2 = "MATCH path= (p:Process {name:'" + $(this).text() + "'})-[:hasSubprocess]-(t:Process) RETURN path"
      query3 = `MATCH (p:Process {name:"` + $(this).text() + `"}) 
      OPTIONAL MATCH (p)-[r3:containsOp]->(c:OperationOfProcess)
      OPTIONAL MATCH (p)-[r5:hasSubprocess]->(p1:Process)-[r1:containsOp]->(c1:OperationOfProcess)
      OPTIONAL MATCH (c)-[f:followedBy]-()
      RETURN c,c1,f, null as p, null as p1, null as r1, null as r5
      UNION ALL
      MATCH (p:Process {name:"` + $(this).text() + `"})-[r5:hasSubprocess]->(p1:Process)-[r1:containsOp]->(c1:OperationOfProcess)
      OPTIONAL MATCH (c1)-[f:followedBy]-()
      RETURN p,p1,r1,c1,r5,f, null as c`
      api.getGraph(query3).then(result => {
        var nodes = new vis.DataSet(result[result.length - 1][0])
        var edges = new vis.DataSet(result[result.length - 1][1])
        var container = document.getElementById('viz3')
        var data = { nodes: nodes, edges: edges };
        var options = {
          autoResize: true,
          nodes: {
            shape: "dot",
            size: 30,
            font: {
              size: 10,
            },
          },
          edges: {
            color: 'gray',
            smooth: false,
            font: {
              size: 10,
            },
            arrows: 'to'
          },
          groups: {
            Process: {
              color: { background: "#00F5FF", border: "black" },
              // shape: "diamond",
            },
            Analysis: {
              color: { background: "#FFFACD", border: "black" },
              // shape: "diamond",
            },
            AlgoSupervised: {
              color: { background: "#FFE4B5", border: "black" },
              // shape: "diamond",
            },
            AnalysisAttribute: {
              color: { background: "#696969", border: "black" },
              // shape: "diamond",
            },
            AnalysisDSRelationship: {
              color: { background: "#708090", border: "black" },
              // shape: "diamond",
            },
            AnalysisFeatures: {
              color: { background: "#000080", border: "black" },
              // shape: "diamond",
            },
            AnalysisNominalFeatures: {
              color: { background: "#008B00", border: "black" },
              // shape: "diamond",
            },
            AnalysisNumericFeatures: {
              color: { background: "#EEDC82", border: "black" },
              // shape: "diamond",
            },
            AnalysisTarget: {
              color: { background: "#EEEE00", border: "black" },
              // shape: "diamond",
            },
            DLSemistructuredDataset: {
              color: { background: "#FFC1C1", border: "black" },
              // shape: "diamond",
            },
            DLStructuredDataset: {
              color: { background: "#8B658B", border: "black" },
              // shape: "diamond",
            },
            DLUnstructuredDataset: {
              color: { background: "#EE6363", border: "black" },
              // shape: "diamond",
            },
            DatasetSource: {
              color: { background: "#FFA500", border: "black" },
              // shape: "diamond",
            },
            EntityClass: {
              color: { background: "#DDA0DD", border: "black" },
              // shape: "diamond",
            },
            EvaluationMeasure: {
              color: { background: "#D8BFD8", border: "black" },
              // shape: "diamond",
            },
            Implementation: {
              color: { background: "#EE7600", border: "black" },
              // shape: "diamond",
            },
            Landmarker: {
              color: { background: "#EEDFCC", border: "black" },
              // shape: "diamond",
            },
            Ingest: {
              color: { background: "#8B8378", border: "black" },
              // shape: "diamond",
            },
            JobTitle: {
              color: { background: "#EE5C42", border: "black" },
              // shape: "diamond",
            },
            ModelEvaluation: {
              color: { background: "#8B3626", border: "black" },
              // shape: "diamond",
            },
            Tag: {
              color: { background: "#FF1493", border: "black" },
              // shape: "diamond",
            },
            RelationshipDS: {
              color: { background: "#00BFFF", border: "black" },
              // shape: "diamond",
            },
            RelationshipAtt: {
              color: { background: "#00688B", border: "black" },
              // shape: "diamond",
            },
            ParameterSetting: {
              color: { background: "#551A8B", border: "black" },
              // shape: "diamond",
            },
            Operation: {
              color: { background: "#1C1C1C", border: "black" },
              // shape: "diamond",
            },
            OperationOfProcess: {
              color: { background: "#BCD2EE", border: "black" },
              // shape: "diamond",
            },
            Parameter: {
              color: { background: "#008B8B", border: "black" },
              // shape: "diamond",
            },
            NominalAttribute: {
              color: { background: "#E0FFFF", border: "black" },
              // shape: "diamond",
            },
            NumericAttribute: {
              color: { background: "#D1EEEE", border: "black" },
              // shape: "diamond",
            },
            Study: {
              color: { background: "#7EC0EE", border: "black" },
              // shape: "diamond",
            },
          }
        };
        var network = new vis.Network(container, data, options);
        network.body.emitter.emit('_dataChanged')
        network.fit()
        network.redraw()
      })
      api.getGraph(query2).then(p => {
        // create an array with nodes
        var nodes = new vis.DataSet(p[p.length - 1][0]);
        // create an array with edges
        var edges = new vis.DataSet(p[p.length - 1][1]);

        // create a network
        var container = document.getElementById("viz2");
        var data = {
          nodes: nodes,
          edges: edges,
        };
        var network = new vis.Network(container, data, options);
        network.body.emitter.emit('_dataChanged')
        network.fit()
        network.redraw()

      })

      //Show the table of process
      setTimeout(() => { $("#processNames").closest(".collapse").collapse('show') }, 500);

    } else { //Event part for the study
      if ($(this)[0].className == "Study") {
        $('#featureButton')[0].style.display = 'block';
        $('#dsRelationButton')[0].style.display = 'none';
        $('#attRelationButton')[0].style.display = 'block';
        $('#operationButton')[0].style.display = 'none';
        $('#similarityButton')[0].style.display = 'none';
        document.getElementById("EntityClassButtonAnalyse").style.display = 'block';
        api
          .getStudies([$(this).text()], typeRecherche, aDate, landmarkerList, algoNames.value, parameterList, evaluationList)
          .then(p => {
            if (p) {
              json = JSON.parse(JSON.stringify(p[0]))
              var $p = $("#properties")
              for (propriete in p[0]) {
                if (propriete == "executionDate" || propriete == 'id') {
                  $p.append("<p>" + propriete + " : " + json[propriete].low + "</p>");
                } else {
                  $p.append("<p>" + propriete + " : " + json[propriete] + "</p>");
                }
              }
            }
          }, "json");
        query = `MATCH path = allshortestpaths ((d)-[*]-(u:Study {name:'` + $(this).text() + `'}))
        WHERE NONE(n IN nodes(path) WHERE n:Tag OR n:Operation) AND (d:DLStructuredDataset OR d:DLSemistructuredDataset OR d:UnstructuredDataset)
        RETURN path` //Study
        api.getGraph(query).then(result => {
          var nodes = new vis.DataSet(result[0][0])
          var edges = new vis.DataSet(result[0][1])
          var container = document.getElementById('viz')
          var data = { nodes: nodes, edges: edges };
          var options = {
            autoResize: true,
            nodes: {
              shape: "dot",
              size: 30,
              font: {
                size: 10,
              },

            },
            edges: {
              color: 'gray',
              smooth: false,
              font: {
                size: 10,
              },
              arrows: 'to'
            },
            layout: {
              hierarchical: {
                direction: "LR",
              },
            },
            groups: {
              Process: {
                color: { background: "#00F5FF", border: "black" },
                // shape: "diamond",
              },
              Analysis: {
                color: { background: "#FFFACD", border: "black" },
                // shape: "diamond",
              },
              AlgoSupervised: {
                color: { background: "#FFE4B5", border: "black" },
                // shape: "diamond",
              },
              AnalysisAttribute: {
                color: { background: "#696969", border: "black" },
                // shape: "diamond",
              },
              AnalysisDSRelationship: {
                color: { background: "#708090", border: "black" },
                // shape: "diamond",
              },
              AnalysisFeatures: {
                color: { background: "#000080", border: "black" },
                // shape: "diamond",
              },
              AnalysisNominalFeatures: {
                color: { background: "#008B00", border: "black" },
                // shape: "diamond",
              },
              AnalysisNumericFeatures: {
                color: { background: "#EEDC82", border: "black" },
                // shape: "diamond",
              },
              AnalysisTarget: {
                color: { background: "#EEEE00", border: "black" },
                // shape: "diamond",
              },
              DLSemistructuredDataset: {
                color: { background: "#FFC1C1", border: "black" },
                // shape: "diamond",
              },
              DLStructuredDataset: {
                color: { background: "#8B658B", border: "black" },
                // shape: "diamond",
              },
              DLUnstructuredDataset: {
                color: { background: "#EE6363", border: "black" },
                // shape: "diamond",
              },
              DatasetSource: {
                color: { background: "#FFA500", border: "black" },
                // shape: "diamond",
              },
              EntityClass: {
                color: { background: "#DDA0DD", border: "black" },
                // shape: "diamond",
              },
              EvaluationMeasure: {
                color: { background: "#D8BFD8", border: "black" },
                // shape: "diamond",
              },
              Implementation: {
                color: { background: "#EE7600", border: "black" },
                // shape: "diamond",
              },
              Landmarker: {
                color: { background: "#EEDFCC", border: "black" },
                // shape: "diamond",
              },
              Ingest: {
                color: { background: "#8B8378", border: "black" },
                // shape: "diamond",
              },
              JobTitle: {
                color: { background: "#EE5C42", border: "black" },
                // shape: "diamond",
              },
              ModelEvaluation: {
                color: { background: "#8B3626", border: "black" },
                // shape: "diamond",
              },
              Tag: {
                color: { background: "#FF1493", border: "black" },
                // shape: "diamond",
              },
              RelationshipDS: {
                color: { background: "#00BFFF", border: "black" },
                // shape: "diamond",
              },
              RelationshipAtt: {
                color: { background: "#00688B", border: "black" },
                // shape: "diamond",
              },
              ParameterSetting: {
                color: { background: "#551A8B", border: "black" },
                // shape: "diamond",
              },
              Operation: {
                color: { background: "#1C1C1C", border: "black" },
                // shape: "diamond",
              },
              OperationOfProcess: {
                color: { background: "#BCD2EE", border: "black" },
                // shape: "diamond",
              },
              Parameter: {
                color: { background: "#008B8B", border: "black" },
                // shape: "diamond",
              },
              NominalAttribute: {
                color: { background: "#E0FFFF", border: "black" },
                // shape: "diamond",
              },
              NumericAttribute: {
                color: { background: "#D1EEEE", border: "black" },
                // shape: "diamond",
              },
              Study: {
                color: { background: "#7EC0EE", border: "black" },
                // shape: "diamond",
              },
            }
          };
          var network = new vis.Network(container, data, options);
          network.body.emitter.emit('_dataChanged')
          network.fit()
          network.redraw()
        })
        //Get the analysis of the study clicked to create a list
        var $list = $(this).parent()

        api
          .getAnalyses($(this).text(), '')
          .then(p => {
            console.log(p)
            console.log($(this).siblings('tr'))
            $(this).siblings('tr').empty()
            p.sort(function (a, b) {
              var nameA = a[0].name.toLowerCase(), nameB = b[0].name.toLowerCase()
              if (nameA < nameB) //sort string ascending
                return -1
              if (nameA > nameB)
                return 1
              return 0 //default return value (no sorting)
            })
            if (p) {
              $("#EntityClassNames").empty()

              $list.append($("<tr class ='analyse'><td class ='analyse'>  Analyses : </td></tr>"));
              for (var i = 0; i < p.length; i++) {
                $list.append($("<tr class ='analyse'><td class ='analyse' id='" + p[i][0].name + "$" + p[i][0].uuid + "'>" + p[i][0].name + "</br><span style='font-size: 11px; color: #828282; font-style: italic;'>" + p[i][1].name + " | " + p[i][0].creationDate.substr(0, 10) + "</span></td></tr>"));
                showEntityClassByAnalyse(p[i][0].uuid, p[i][0].name)
              }
            }
          }, "json");



        setTimeout(() => { $("#analyseNames").closest(".collapse").collapse('show') }, 500);

      } else { //Event part for the Dataset
        if ($(this)[0].className == "Database") {
          $('#featureButton')[0].style.display = 'none';
          $('#dsRelationButton')[0].style.display = 'block';
          $('#attRelationButton')[0].style.display = 'block';
          $('#operationButton')[0].style.display = 'none';
          $('#similarityButton')[0].style.display = 'block';

          //Clean the different tabs used by dataset information.
          $('#relationshipOnglet').empty()
          $('#relationshipContent').empty()
          $('#relationshipAttOnglet').empty()
          $('#relationshipAttContent').empty()
          $('#attributeList').empty()

          //Check the type of dataset
          if ((($(this)[0].id).toLowerCase()).includes("semi")) {
            var typeDS = 'Semi-Structured';
          } else {
            if ((($(this)[0].id).toLowerCase()).includes("un")) {
              var typeDS = 'Unstructured';
            } else {
              var typeDS = 'Structured';
            }
          }
          //get dataset informations
          document.getElementById("EntityClassButtonDataset").style.display = 'block';
          api
            .getDatabases([$(this).text()], typeDS)
            .then(p => {
              if (p) {
                json = JSON.parse(JSON.stringify(p[0]))
                var $p = $("#properties")
                for (propriete in p[0]) {
                  $p.append("<p>" + propriete + " : " + json[propriete] + "</p>");
                }
                $('#EntityClassProperties').empty()
                //get entity class by dataset to create a list
                showEntityClassByDataset(p[0].uuid, p[0].name, typeDS)
              }
            }, "json");


          var relationlist = []
          //Get the relation between this dataset and others
          api
            .getRelationshipDSbyDataset($(this).attr('id').split('$')[1], $(this).attr('id').split('$')[2], 'RelationshipDS')
            .then(p => {
              $listTab = $('#relationshipOnglet')
              $listContent = $('#relationshipContent')
              //Create tabs for each relation
              for (var i = 0; i < p.length; i++) {
                relationlist.push(p[i].name)
                $listTab.append('<li><a data-toggle="tab" href="#' + p[i].name + '" id="a_' + p[i].name + '">' + p[i].name + '</a></li>')
                $listContent.append(`
                <div id='`+ p[i].name + `' class="tab-pane fade">
                    <table class='relationshiptable'>
                    <tbody id='dataset_` + p[i].name + `'><tbody>
                    </table>
                </div>`)
              }
              for (var i = 0; i < relationlist.length; i++) {
                //for each relation get dataset and relation value
                getDatasetOfRelationship($(this).attr('id').split('$')[1], $(this).attr('id').split('$')[2], relationlist[i])
              }
              for (var j = 0; j < relationlist.length; j++) {
                /*console.log(relationlistAtt[j])*/
                datasetChosed = [$(this).attr('id').split('$')[1], $(this).attr('id').split('$')[2]]
                /*console.log(datasetChosed[0])
                console.log(datasetChosed[1])*/
                //add Eventlistener for each tab
                document.getElementById("a_" + relationlist[j]).addEventListener("click", getGrapheViz4Init)
              }
            }, 'json')

          //same for the attribute
          $('#relationshipAttOnglet').empty()
          $('#relationshipAttContent').empty()
          api
            .getRelationshipAttribute($(this).attr('id').split('$')[2], '', 'relation')
            .then(p => {
              var relationlistAtt = []
              // console.log(p)
              $listTab = $('#relationshipAttOnglet')
              $listContent = $('#relationshipAttContent')
              for (var i = 0; i < p.length; i++) {
                relationlistAtt.push(p[i].name)
                console.log(p[i].name)
                $listTab.append('<li><a data-toggle="tab" href="#' + p[i].name + '" id="a_' + p[i].name + '">' + p[i].name + '</a></li>')
                $listContent.append(`
                <div id='`+ p[i].name + `' class="tab-pane fade">
                    <table class='relationshiptable'>
                        <tbody id='attribute_` + p[i].name + `'><tbody>
                    </table>                
                </div>`)
              }

              for (var i = 0; i < relationlistAtt.length; i++) {
                // console.log(relationlistAtt[i])
                getAnalyseOfRelationship($(this).attr('id').split('$')[2], relationlistAtt[i]);
              }
              for (var j = 0; j < relationlistAtt.length; j++) {
                /*console.log(document.getElementById("a_"+relationlistAtt[j]))*/
                trans = $(this).attr('id').split('$')[2]
                //add eventlistener for each tab of relationshipAttribute
                document.getElementById("a_" + relationlistAtt[j]).addEventListener("click", getGrapheViz5Init)
              }
            }, 'json')

          $('#similarityResult').empty()
          $('#similarityResult').append('<table>')
          for (var i = 0; i < similarityGraph.length; i++) {
            if (similarityGraph[i][0] == $(this).text()) {
              $('#similarityResult').append($('<tr><td>' + similarityGraph[i][0] + ' || ' + similarityGraph[i][1] + ' : </td> <td><span>' + similarityGraph[i][2] + '</span></td></tr>'))
            }
          }
          $('#similarityResult').append('</table>')
          if ($('#similarityResult span:first-child').first()[0]) {
            $('#similarityResult span:first-child').first()[0].style.color = 'green'
            $('#similarityResult span:first-child').last()[0].style.color = 'red'
          }

          query2 = `MATCH (d) 
          WHERE (d:DLStructuredDataset OR d:DLSemistructuredDataset OR d:DLUnstructuredDataset) AND d.uuid = "` + $(this).attr('id').split('$')[2] + `"
          OPTIONAL MATCH (d)-[r:sourceData]->(p:Process)
          WHERE NOT (p)<-[:hasSubprocess]-()
          OPTIONAL MATCH (d)<-[s:targetData]-(p1:Process)
          WHERE NOT (p1)<-[:hasSubprocess]-()
          with d,p,p1,r,s 
          RETURN d,p,p1,r,s
          UNION ALL
          MATCH (d) 
          WHERE (d:DLStructuredDataset OR d:DLSemistructuredDataset OR d:DLUnstructuredDataset) AND d.uuid = "` + $(this).attr('id').split('$')[2] + `"
          OPTIONAL MATCH (d)-[r:sourceData]->(p:Process)
          OPTIONAL MATCH (d)<-[s:targetData]-(p1:Process)
          with d,p,p1,r,s
          WHERE NOT exists((p)<-[:hasSubprocess]-(:Process)-[]-(d)) AND NOT exists((p1)<-[:hasSubprocess]-(:Process)-[]-(d))
          RETURN d,p,p1,r,s`
          query = `MATCH path = allshortestpaths ((ds:DatasetSource)-[*]-(d))
          WHERE NONE(n IN nodes(path) WHERE n:Tag OR n:Operation OR n:AnalysisDSRelationship) AND (d:DLStructuredDataset OR d:DLSemistructuredDataset OR d:UnstructuredDataset) AND d.uuid = '` + $(this).attr('id').split('$')[2] + `'
          RETURN path
          UNION ALL
          MATCH path = allshortestpaths ((sos:SourceOfSteam)-[*]-(d))
          WHERE NONE(n IN nodes(path) WHERE n:Tag OR n:Operation OR n:AnalysisDSRelationship) AND (d:DLStructuredDataset OR d:DLSemistructuredDataset OR d:UnstructuredDataset) AND d.uuid = '` + $(this).attr('id').split('$')[2] + `'
          RETURN path`
          api.getGraph(query).then(result => {
            var nodes = new vis.DataSet(result[0][0])
            var edges = new vis.DataSet(result[0][1])
            var container = document.getElementById('viz')
            var data = { nodes: nodes, edges: edges };
            var options = {
              autoResize: true,
              height: '100%',
              width: '100%',
              nodes: {
                shape: "dot",
                size: 30,
                font: {
                  size: 10,
                },

              },
              edges: {
                color: 'gray',
                smooth: false,
                font: {
                  size: 10,
                },
                arrows: 'to'
              },
              layout: {
                hierarchical: {
                  direction: "RL",
                },
              },
              groups: {
                Process: {
                  color: { background: "#00F5FF", border: "black" },
                  // shape: "diamond",
                },
                Analysis: {
                  color: { background: "#FFFACD", border: "black" },
                  // shape: "diamond",
                },
                AlgoSupervised: {
                  color: { background: "#FFE4B5", border: "black" },
                  // shape: "diamond",
                },
                AnalysisAttribute: {
                  color: { background: "#696969", border: "black" },
                  // shape: "diamond",
                },
                AnalysisDSRelationship: {
                  color: { background: "#708090", border: "black" },
                  // shape: "diamond",
                },
                AnalysisFeatures: {
                  color: { background: "#000080", border: "black" },
                  // shape: "diamond",
                },
                AnalysisNominalFeatures: {
                  color: { background: "#008B00", border: "black" },
                  // shape: "diamond",
                },
                AnalysisNumericFeatures: {
                  color: { background: "#EEDC82", border: "black" },
                  // shape: "diamond",
                },
                AnalysisTarget: {
                  color: { background: "#EEEE00", border: "black" },
                  // shape: "diamond",
                },
                DLSemistructuredDataset: {
                  color: { background: "#FFC1C1", border: "black" },
                  // shape: "diamond",
                },
                DLStructuredDataset: {
                  color: { background: "#8B658B", border: "black" },
                  // shape: "diamond",
                },
                DLUnstructuredDataset: {
                  color: { background: "#EE6363", border: "black" },
                  // shape: "diamond",
                },
                DatasetSource: {
                  color: { background: "#FFA500", border: "black" },
                  // shape: "diamond",
                },
                EntityClass: {
                  color: { background: "#DDA0DD", border: "black" },
                  // shape: "diamond",
                },
                EvaluationMeasure: {
                  color: { background: "#D8BFD8", border: "black" },
                  // shape: "diamond",
                },
                Implementation: {
                  color: { background: "#EE7600", border: "black" },
                  // shape: "diamond",
                },
                Landmarker: {
                  color: { background: "#EEDFCC", border: "black" },
                  // shape: "diamond",
                },
                Ingest: {
                  color: { background: "#8B8378", border: "black" },
                  // shape: "diamond",
                },
                JobTitle: {
                  color: { background: "#EE5C42", border: "black" },
                  // shape: "diamond",
                },
                ModelEvaluation: {
                  color: { background: "#8B3626", border: "black" },
                  // shape: "diamond",
                },
                Tag: {
                  color: { background: "#FF1493", border: "black" },
                  // shape: "diamond",
                },
                RelationshipDS: {
                  color: { background: "#00BFFF", border: "black" },
                  // shape: "diamond",
                },
                RelationshipAtt: {
                  color: { background: "#00688B", border: "black" },
                  // shape: "diamond",
                },
                ParameterSetting: {
                  color: { background: "#551A8B", border: "black" },
                  // shape: "diamond",
                },
                Operation: {
                  color: { background: "#1C1C1C", border: "black" },
                  // shape: "diamond",
                },
                OperationOfProcess: {
                  color: { background: "#BCD2EE", border: "black" },
                  // shape: "diamond",
                },
                Parameter: {
                  color: { background: "#008B8B", border: "black" },
                  // shape: "diamond",
                },
                NominalAttribute: {
                  color: { background: "#E0FFFF", border: "black" },
                  // shape: "diamond",
                },
                NumericAttribute: {
                  color: { background: "#D1EEEE", border: "black" },
                  // shape: "diamond",
                },
                Study: {
                  color: { background: "#7EC0EE", border: "black" },
                  // shape: "diamond",
                },
              }
            };
            var promisegraph = new Promise((resolve, reject) => {
              var network = new vis.Network(container, data, options);
              if (network) {
                resolve();
              }
            })
            promisegraph.then(() => {
              network.body.emitter.emit('_dataChanged')
              network.fit()
            })
            promisegraph.finally(() => {
              network.redraw()
            })
            var network = new vis.Network(container, data, options);
            network.fit()
            network.body.emitter.emit('_dataChanged')
            network.fit();
            network.redraw();
            network.fit();
          })
          /*//query4 for dataset relationship
          query4 = `MATCH (dl)<-[r1:withDataset]-()-[r2:hasRelationshipDataset]->(rDS:RelationshipDS),(autreDS)<-[r3:withDataset]-()-[r4:hasRelationshipDataset]->(rDS:RelationshipDS),(autreDS)<-[r5:withDataset]-(adrR)-[r6:withDataset]->(dl)
          WHERE dl.name CONTAINS '`+ $(this).attr('id').split('$')[1] + `' and dl.uuid = '` + $(this).attr('id').split('$')[2] + `'
          AND
          (autreDS:DLStructuredDataset OR autreDS:DLSemistructuredDataset OR autreDS:DLUnstructuredDataset)
          RETURN DISTINCT dl,rDS,autreDS,adrR,r1,r2,r3,r4,r5,r6`*/
          //query5 for attribute relationship
          /*query5 = `MATCH (dl)-[]-(e:EntityClass)-[]-(a),(a)-[r1:hasAttribute]-(AA:AnalysisAttribute)-[r2:useMeasure]-(RA:RelationshipAtt),(AA)-[r3:hasAttribute]-(a2)
            WHERE dl.uuid = '` + $(this).attr('id').split('$')[2] + `'
            AND
            (a:NominalAttribute OR a:NumericAttribute)
            RETURN DISTINCT a,r1,AA,r2,RA,a2,r3`
          console.log("query5")
          console.log(query5)
          api.getGraph(query5).then(p => {
            // create an array with nodes
            var nodes = new vis.DataSet(p[p.length - 1][0]);
            // create an array with edges
            var edges = new vis.DataSet(p[p.length - 1][1]);

            // create a network
            var container = document.getElementById("viz5");
            var data = {
              nodes: nodes,
              edges: edges,
            };
            var network = new vis.Network(container, data, options);
            network.body.emitter.emit('_dataChanged')
            network.redraw()
            network.fit()
          })*/
          console.log(query2)
          api.getGraph(query2).then(p => {
            // create an array with nodes
            var nodes = new vis.DataSet(p[p.length - 1][0]);
            // create an array with edges
            var edges = new vis.DataSet(p[p.length - 1][1]);

            // create a network
            var container = document.getElementById("viz2");
            var data = {
              nodes: nodes,
              edges: edges,
            };
            var network = new vis.Network(container, data, options);
            network.body.emitter.emit('_dataChanged')
            network.redraw()
            network.fit()
          })
          /*console.log("QQQQQQQQQQQ4")
          console.log(query4)*/
          /*api.getGraph(query4).then(p => {
            // create an array with nodes
            var nodes = new vis.DataSet(p[p.length - 1][0]);
            // create an array with edges
            var edges = new vis.DataSet(p[p.length - 1][1]);

            // create a network
            var container = document.getElementById("viz4");
            var data = {
              nodes: nodes,
              edges: edges,
            };

            var network = new vis.Network(container, data, options);
            network.body.emitter.emit('_dataChanged')
            network.redraw()
            network.fit()
          })*/

          setTimeout(() => { $("#dbNames").closest(".collapse").collapse('show') }, 500);

        } else { //Event part for the analyse
          if ($(this)[0].className == "analyse") {
            $('#featureButton')[0].style.display = 'block';
            $('#dsRelationButton')[0].style.display = 'none';
            $('#attRelationButton')[0].style.display = 'block';
            $('#operationButton')[0].style.display = 'none';
            $('#similarityButton')[0].style.display = 'none';

            $('#relationshipAttOnglet').empty()
            $('#relationshipAttContent').empty()
            $('#attributeList').empty()
            document.getElementById("EntityClassButtonAnalyse").style.display = 'block';
            api
              .getAnalyses('', $(this).attr('id').split('$')[0], $(this).attr('id').split('$')[1])
              .then(p => {
                json = JSON.parse(JSON.stringify(p[0][0]))
                var $p = $("#properties")
                for (propriete in p[0][0]) {

                  $p.append("<p>" + propriete + " : " + json[propriete] + "</p>");
                }
              }, "json");

            setTimeout(() => { $("#analyseNames").closest(".collapse").collapse('show') }, 500);

            //Get numeric and nominal features to create an interface with their properties
            api.getNumericFeaturesbyAnalysis($(this).attr('id').split('$')[1]).then(pNu => {
              $('#NumericFeaturesNames').empty()
              json = JSON.parse(JSON.stringify(pNu[0]))
              var $list = $('#NumericFeaturesNames')
              for (propriete in pNu[0]) {
                if (json[propriete]) {
                  $list.append("<p>" + propriete + " : " + json[propriete] + "</p>");
                }
              }
            }, 'json');

            api.getNominalFeaturesbyAnalysis($(this).attr('id').split('$')[1]).then(pNo => {
              $('#NominalFeaturesNames').empty()
              json = JSON.parse(JSON.stringify(pNo[0]))
              var $list = $('#NominalFeaturesNames')
              for (propriete in pNo[0]) {
                if (json[propriete]) {
                  $list.append("<p>" + propriete + " : " + json[propriete] + "</p>");
                }
              }
            }, 'json');
            $('#AttributesNames').empty()

            //get numeric and nominal attribute to get their information
            api.getNominalAttributebyAnalysis($(this).attr('id').split('$')[1]).then(na => {
              var $list = $('#AttributesNames')
              $list.append('"<tr><td><h4>Nominal Attribute</h4></td></tr>')
              for (var i = 0; i < na.length; i++) {
                $list.append("<tr><td class='Attribute' id='" + na[i].name + "$" + $(this).attr('id').split('$')[1] + "$nominal'>" + na[i].name + "</td></tr>")
              }
            }, 'json');

            api.getNumericAttributebyAnalysis($(this).attr('id').split('$')[1]).then(na => {
              var $list = $('#AttributesNames')
              $list.append('<tr><td><h4>Numeric Attribute</h4></td></tr>')
              for (var i = 0; i < na.length; i++) {
                $list.append("<tr><td class='Attribute' id='" + na[i].name + "$" + $(this).attr('id').split('$')[1] + "$numeric'>" + na[i].name + "</td></tr>")
              }
            }, 'json');


            //Part for the relationship between attribute
            $('#relationshipAttOnglet').empty()
            $('#relationshipAttContent').empty()
            api
              .getRelationshipAttribute($(this).attr('id').split('$')[1], '', 'relation')
              .then(p => {
                console.log("llllllllllllllllll")
                console.log(p.length)
                var relationlistAtt = []
                // console.log(p)
                $listTab = $('#relationshipAttOnglet')
                $listContent = $('#relationshipAttContent')
                for (var i = 0; i < p.length; i++) {
                  relationlistAtt.push(p[i].name)
                  console.log(p[i].name)
                  $listTab.append('<li><a data-toggle="tab" href="#' + p[i].name + '" id="a_' + p[i].name + '">' + p[i].name + '</a></li>')
                  $listContent.append(`
                <div id='`+ p[i].name + `' class="tab-pane fade">
                    <table class='relationshiptable'>
                        <tbody id='attribute_` + p[i].name + `'><tbody>
                    </table>                
                </div>`)
                }

                for (var i = 0; i < relationlistAtt.length; i++) {
                  // console.log(relationlistAtt[i])
                  getAnalyseOfRelationship($(this).attr('id').split('$')[1], relationlistAtt[i]);
                }
                for (var j = 0; j < relationlistAtt.length; j++) {
                  /*console.log(document.getElementById("a_"+relationlistAtt[j]))*/
                  trans = $(this).attr('id').split('$')[1]
                  //add eventlistener for each tab of relationshipAttribute
                  document.getElementById("a_" + relationlistAtt[j]).addEventListener("click", getGrapheViz5Init)
                }
              }, 'json')
            /*api
              .getRelationshipAttribute($(this).attr('id').split('$')[1], '', 'relation')
              .then(p => {
                var relationlistAtt = []
                console.log(p)
                $listTab = $('#relationshipAttOnglet')
                $listContent = $('#relationshipAttContent')
                for (var i = 0; i < p.length; i++) {
                  relationlistAtt.push(p[i].name)
                  $listTab.append('<li><a data-toggle="tab" href="#' + p[i].name + '" id="a_' + p[i].name + '">' + p[i].name + '</a></li>')

                  $listContent.append(`
                <div id='`+ p[i].name + `' class="tab-pane fade">
                    <table class='relationshiptable'>
                        <tbody id='attribute_` + p[i].name + `'><tbody>
                    </table>
                </div>`)
                }
                for (var i = 0; i < relationlistAtt.length; i++) {
                  console.log($(this).attr('id').split('$')[1])
                  getAnalyseOfRelationship($(this).attr('id').split('$')[1], relationlistAtt[i]);
                }
                for (var j = 0; j < relationlistAtt.length; j++) {
                  /!*console.log(j)
                  console.log(relationlistAtt[j])
                  console.log(document.getElementById("a_"+relationlistAtt[j]))*!/
                  trans = $(this).attr('id').split('$')[1]
                  document.getElementById("a_" + relationlistAtt[j]).addEventListener("click", getGrapheViz5Init)
                }
              }, 'json')*/


            //Query part
            query = `MATCH path = shortestPath ((d:DatasetSource)-[*]-(u:Analysis {uuid:"` + $(this).attr('id').split('$')[1] + `"}))
            WHERE NONE(n IN nodes(path) WHERE n:Tag OR n:Operation OR n:AnalysisDSRelationship OR n:Study)
            RETURN path
            UNION ALL
            MATCH path = shortestPath ((d)-[*..1]-(u:Analysis {uuid:"` + $(this).attr('id').split('$')[1] + `"}))
            WHERE NONE(n IN nodes(path) WHERE n:Tag OR n:Operation OR n:AnalysisDSRelationship OR n:Study)
            AND (d:DLStructuredDataset OR d:DLSemistructuredDataset OR d:DLUnstructuredDataset)
            RETURN path` //Analyse
            console.log(query)
            api.getGraph(query).then(result => {
              console.log(result)
              var nodes = new vis.DataSet(result[0][0])
              var edges = new vis.DataSet(result[0][1])
              var container = document.getElementById('viz')
              var data = { nodes: nodes, edges: edges };
              var options = {
                autoResize: true,
                nodes: {
                  shape: "dot",
                  size: 30,
                  font: {
                    size: 10,
                  },

                },
                edges: {
                  color: 'gray',
                  smooth: false,
                  font: {
                    size: 10,
                  },
                  arrows: 'to'
                },
                layout: {
                  hierarchical: {
                    direction: "LR",
                  },
                },
                groups: {
                  Process: {
                    color: { background: "#00F5FF", border: "black" },
                    // shape: "diamond",
                  },
                  Analysis: {
                    color: { background: "#FFFACD", border: "black" },
                    // shape: "diamond",
                  },
                  AlgoSupervised: {
                    color: { background: "#FFE4B5", border: "black" },
                    // shape: "diamond",
                  },
                  AnalysisAttribute: {
                    color: { background: "#696969", border: "black" },
                    // shape: "diamond",
                  },
                  AnalysisDSRelationship: {
                    color: { background: "#708090", border: "black" },
                    // shape: "diamond",
                  },
                  AnalysisFeatures: {
                    color: { background: "#000080", border: "black" },
                    // shape: "diamond",
                  },
                  AnalysisNominalFeatures: {
                    color: { background: "#008B00", border: "black" },
                    // shape: "diamond",
                  },
                  AnalysisNumericFeatures: {
                    color: { background: "#EEDC82", border: "black" },
                    // shape: "diamond",
                  },
                  AnalysisTarget: {
                    color: { background: "#EEEE00", border: "black" },
                    // shape: "diamond",
                  },
                  DLSemistructuredDataset: {
                    color: { background: "#FFC1C1", border: "black" },
                    // shape: "diamond",
                  },
                  DLStructuredDataset: {
                    color: { background: "#8B658B", border: "black" },
                    // shape: "diamond",
                  },
                  DLUnstructuredDataset: {
                    color: { background: "#EE6363", border: "black" },
                    // shape: "diamond",
                  },
                  DatasetSource: {
                    color: { background: "#FFA500", border: "black" },
                    // shape: "diamond",
                  },
                  EntityClass: {
                    color: { background: "#DDA0DD", border: "black" },
                    // shape: "diamond",
                  },
                  EvaluationMeasure: {
                    color: { background: "#D8BFD8", border: "black" },
                    // shape: "diamond",
                  },
                  Implementation: {
                    color: { background: "#EE7600", border: "black" },
                    // shape: "diamond",
                  },
                  Landmarker: {
                    color: { background: "#EEDFCC", border: "black" },
                    // shape: "diamond",
                  },
                  Ingest: {
                    color: { background: "#8B8378", border: "black" },
                    // shape: "diamond",
                  },
                  JobTitle: {
                    color: { background: "#EE5C42", border: "black" },
                    // shape: "diamond",
                  },
                  ModelEvaluation: {
                    color: { background: "#8B3626", border: "black" },
                    // shape: "diamond",
                  },
                  Tag: {
                    color: { background: "#FF1493", border: "black" },
                    // shape: "diamond",
                  },
                  RelationshipDS: {
                    color: { background: "#00BFFF", border: "black" },
                    // shape: "diamond",
                  },
                  RelationshipAtt: {
                    color: { background: "#00688B", border: "black" },
                    // shape: "diamond",
                  },
                  ParameterSetting: {
                    color: { background: "#551A8B", border: "black" },
                    // shape: "diamond",
                  },
                  Operation: {
                    color: { background: "#1C1C1C", border: "black" },
                    // shape: "diamond",
                  },
                  OperationOfProcess: {
                    color: { background: "#BCD2EE", border: "black" },
                    // shape: "diamond",
                  },
                  Parameter: {
                    color: { background: "#008B8B", border: "black" },
                    // shape: "diamond",
                  },
                  NominalAttribute: {
                    color: { background: "#E0FFFF", border: "black" },
                    // shape: "diamond",
                  },
                  NumericAttribute: {
                    color: { background: "#D1EEEE", border: "black" },
                    // shape: "diamond",
                  },
                  Study: {
                    color: { background: "#7EC0EE", border: "black" },
                    // shape: "diamond",
                  },
                }
              };
              var network = new vis.Network(container, data, options);
              network.body.emitter.emit('_dataChanged')
              network.redraw()
              network.fit()
            })
            query2 = `MATCH (a:Analysis)
            MATCH (a)<-[r1:hasAnalysis]-(s:Study)
            MATCH (a)<-[r2:evaluateAnalysis]-(me:ModelEvaluation)-[r3:useEvaluationMeasure]->(em:EvaluationMeasure)
            WHERE
            toLower(a.name) CONTAINS toLower('`+ $(this).attr('id').split('$')[0] + `') AND a.uuid = '` + $(this).attr('id').split('$')[1] + `'
            WITH a,s,em,me,r1,r2,r3
            OPTIONAL MATCH (a)-[r4:hasImplementation]-(ld:Landmarker)
            WITH a,s,em,me,ld,r1,r2,r3,r4
            OPTIONAL MATCH (a)-[r5:hasImplementation]->(i:Implementation)-[r6:usesAlgo]->(al:AlgoSupervised),(i)-[r7:hasParameterSetting]->(ps:ParameterSetting)<-[r8:hasParameterValue]-(p:Parameter)<-[r9:hasParameter]-(i)
            RETURN a,s,me,em,ld,i,al,p,ps,r1,r2,r3,r4,r5,r6,r7,r8,r9`
            /*query5 = `MATCH (dl)-[]-(e:EntityClass)-[]-(a),(a)-[r1:hasAttribute]-(AA:AnalysisAttribute)-[r2:useMeasure]-(RA:RelationshipAtt),(AA)-[r3:hasAttribute]-(a2)
            WHERE dl.uuid = '` + $(this).attr('id').split('$')[1] + `'
            AND
            (a:NominalAttribute OR a:NumericAttribute OR a:Attribute)
            RETURN DISTINCT a,r1,AA,r2,RA,a2,r3`
            api.getGraph(query5).then(p => {
              // create an array with nodes
              var nodes = new vis.DataSet(p[p.length - 1][0]);
              // create an array with edges
              var edges = new vis.DataSet(p[p.length - 1][1]);

              // create a network
              var container = document.getElementById("viz5");
              var data = {
                nodes: nodes,
                edges: edges,
              };

              var network = new vis.Network(container, data, options);
              network.body.emitter.emit('_dataChanged')
              network.redraw()
              network.fit()
            })*/
            console.log(query2)
            api.getGraph(query2).then(p => {
              // create an array with nodes
              var nodes = new vis.DataSet(p[p.length - 1][0]);
              // create an array with edges
              var edges = new vis.DataSet(p[p.length - 1][1]);

              // create a network
              var container = document.getElementById("viz2");
              var data = {
                nodes: nodes,
                edges: edges,
              };

              var network = new vis.Network(container, data, options);
              network.body.emitter.emit('_dataChanged')
              network.redraw()
              network.fit()
            })
          }
        }
      }
    }

  });

  //Checkbox event for the primary filter (those who are not within the more)
  $('#filter :checkbox').change(function () {
    // this will contain a reference to the checkbox
    if (this.checked) {
      typeRecherche.push(this.id);
      console.log(typeRecherche)
      //Check the type of checkbox
      if (typeRecherche.includes("Structured") || typeRecherche.includes("Semi-Structured") || typeRecherche.includes("Unstructured")) {
        $("#dbNames").empty()
        showDatabases(tagsinput, typeRecherche, dsDate, "", "", inputECAnames);
      }
      if (typeRecherche.includes("supervised") || typeRecherche.includes("descriptive") || typeRecherche.includes("diagnostic") || typeRecherche.includes("predictive") || typeRecherche.includes("prescriptive") || typeRecherche.includes("algosupervised") || typeRecherche.includes("algoUnsupervised") || typeRecherche.includes("algoReinforcement")) {
        $("#analyseNames").empty()
        showStudies(tagsinput, typeRecherche, aDate, landmarkerList, algoNames.value, parameterList, evaluationList);
        $('#algoNames')[0].style.display = 'none'
        $('#algosupervised')[0].style.display = 'none'
        $('#algoUnsupervised')[0].style.display = 'none'
        $('#AlgoReinforcement')[0].style.display = 'none'
        $('#parameter')[0].style.display = 'none'
        $('#evaluation')[0].style.display = 'none'
        $('#landmarker')[0].style.display = 'none'
        $('label[for="algoNames"]')[0].style.display = 'none'
        $('label[for="algosupervised"]')[0].style.display = 'none'
        $('label[for="algoUnsupervised"]')[0].style.display = 'none'
        $('label[for="algoReinforcement"]')[0].style.display = 'none'
        if (typeRecherche.includes("supervised")) {
          $('#algoNames')[0].style.display = 'inline-block'
          $('#algosupervised')[0].style.display = 'inline-block'
          $('#algoUnsupervised')[0].style.display = 'inline-block'
          $('#AlgoReinforcement')[0].style.display = 'inline-block'
          $('#parameter')[0].style.display = 'inline-block'
          $('#evaluation')[0].style.display = 'inline-block'
          $('#landmarker')[0].style.display = 'inline-block'
          $('label[for="algoNames"]')[0].style.display = 'inline-block'
          $('label[for="algosupervised"]')[0].style.display = 'inline-block'
          $('label[for="algoUnsupervised"]')[0].style.display = 'inline-block'
          $('label[for="algoReinforcement"]')[0].style.display = 'inline-block'
        }
      }
      if (typeRecherche.includes("machineLearning") || (typeRecherche.includes("machineLearning") && typeRecherche.includes("otherAnalysis"))) {
        $('#supervised')[0].style.display = 'inline-block'
        $('#descriptive')[0].style.display = 'inline-block'
        $('#diagnostic')[0].style.display = 'inline-block'
        $('#predictive')[0].style.display = 'inline-block'
        $('#prescriptive')[0].style.display = 'inline-block'
        $('label[for="supervised"]')[0].style.display = 'inline-block'
        $('label[for="descriptive"]')[0].style.display = 'inline-block'
        $('label[for="diagnostic"]')[0].style.display = 'inline-block'
        $('label[for="predictive"]')[0].style.display = 'inline-block'
        $('label[for="prescriptive"]')[0].style.display = 'inline-block'
      }
      if (typeRecherche.includes("otherAnalysis") && !(typeRecherche.includes("machineLearning"))) {
        $('#supervised')[0].style.display = 'none'
        $('#descriptive')[0].style.display = 'none'
        $('#diagnostic')[0].style.display = 'none'
        $('#predictive')[0].style.display = 'none'
        $('#prescriptive')[0].style.display = 'none'
        $('label[for="supervised"]')[0].style.display = 'none'
        $('label[for="descriptive"]')[0].style.display = 'none'
        $('label[for="diagnostic"]')[0].style.display = 'none'
        $('label[for="predictive"]')[0].style.display = 'none'
        $('label[for="prescriptive"]')[0].style.display = 'none'
        $('#algoNames')[0].style.display = 'none'
        $('#algosupervised')[0].style.display = 'none'
        $('#algoUnsupervised')[0].style.display = 'none'
        $('#AlgoReinforcement')[0].style.display = 'none'
        $('#parameter')[0].style.display = 'none'
        $('#evaluation')[0].style.display = 'none'
        $('#landmarker')[0].style.display = 'none'
        $('label[for="algoNames"]')[0].style.display = 'none'
        $('label[for="algosupervised"]')[0].style.display = 'none'
        $('label[for="algoUnsupervised"]')[0].style.display = 'none'
        $('label[for="algoReinforcement"]')[0].style.display = 'none'
      }
    } else {
      //Remove the filtre of the unchecked box
      const index = typeRecherche.indexOf(this.id);
      if (index > -1) {
        typeRecherche.splice(index, 1);
      }
      // the checkbox is now no longer checked
      $(".names").empty()
      if (typeRecherche.length == 0) {
        showProcesses(tagsinput, langList, pDate, typeOpe, exeEnvList);
        showStudies(tagsinput, typeRecherche, aDate, landmarkerList, algoNames.value, parameterList, evaluationList);
        showDatabases(tagsinput, typeRecherche, dsDate, "", "", inputECAnames);
      }
      else {
        showProcesses(tagsinput, langList, pDate, typeOpe, exeEnvList);
        $('#algoNames')[0].style.display = 'none'
        $('#algosupervised')[0].style.display = 'none'
        $('#algoUnsupervised')[0].style.display = 'none'
        $('#AlgoReinforcement')[0].style.display = 'none'
        $('#parameter')[0].style.display = 'none'
        $('#evaluation')[0].style.display = 'none'
        $('#landmarker')[0].style.display = 'none'
        $('label[for="algoNames"]')[0].style.display = 'none'
        $('label[for="algosupervised"]')[0].style.display = 'none'
        $('label[for="algoUnsupervised"]')[0].style.display = 'none'
        $('label[for="algoReinforcement"]')[0].style.display = 'none'
        if (typeRecherche.includes("Structured") || typeRecherche.includes("Semi-Structured") || typeRecherche.includes("Unstructured")) {
          $("#dbNames").empty()
          showDatabases(tagsinput, typeRecherche, dsDate, "", "", inputECAnames);
        }
        if (typeRecherche.includes("supervised") || typeRecherche.includes("descriptive") || typeRecherche.includes("diagnostic") || typeRecherche.includes("predictive") || typeRecherche.includes("prescriptive") || typeRecherche.includes("algosupervised") || typeRecherche.includes("algoUnsupervised") || typeRecherche.includes("algoReinforcement")) {
          $("#analyseNames").empty()
          showStudies(tagsinput, typeRecherche, aDate, landmarkerList, algoNames.value, parameterList, evaluationList);
          if (typeRecherche.includes("supervised")) {
            $('#algoNames')[0].style.display = 'inline-block'
            $('#algosupervised')[0].style.display = 'inline-block'
            $('#algoUnsupervised')[0].style.display = 'inline-block'
            $('#AlgoReinforcement')[0].style.display = 'inline-block'
            $('#parameter')[0].style.display = 'inline-block'
            $('#evaluation')[0].style.display = 'inline-block'
            $('#landmarker')[0].style.display = 'inline-block'
            $('label[for="algoNames"]')[0].style.display = 'inline-block'
            $('label[for="algosupervised"]')[0].style.display = 'inline-block'
            $('label[for="algoUnsupervised"]')[0].style.display = 'inline-block'
            $('label[for="algoReinforcement"]')[0].style.display = 'inline-block'
          }
        }
        if (typeRecherche.includes("machineLearning") || (typeRecherche.includes("machineLearning") && typeRecherche.includes("otherAnalysis"))) {
          showProcesses(tagsinput, langList, pDate, typeOpe, exeEnvList);
          showStudies(tagsinput, typeRecherche, aDate, landmarkerList, algoNames.value, parameterList, evaluationList);
          showDatabases(tagsinput, typeRecherche, dsDate, "", "", inputECAnames);
          $('#supervised')[0].style.display = 'inline-block'
          $('#descriptive')[0].style.display = 'inline-block'
          $('#diagnostic')[0].style.display = 'inline-block'
          $('#predictive')[0].style.display = 'inline-block'
          $('#prescriptive')[0].style.display = 'inline-block'
          $('label[for="supervised"]')[0].style.display = 'inline-block'
          $('label[for="descriptive"]')[0].style.display = 'inline-block'
          $('label[for="diagnostic"]')[0].style.display = 'inline-block'
          $('label[for="predictive"]')[0].style.display = 'inline-block'
          $('label[for="prescriptive"]')[0].style.display = 'inline-block'
        }
        if (typeRecherche.includes("otherAnalysis") && !(typeRecherche.includes("machineLearning"))) {
          showProcesses(tagsinput, langList, pDate, typeOpe, exeEnvList);
          showStudies(tagsinput, typeRecherche, aDate, landmarkerList, algoNames.value, parameterList, evaluationList);
          showDatabases(tagsinput, typeRecherche, dsDate, "", "", inputECAnames);
          $('#supervised')[0].style.display = 'none'
          $('#descriptive')[0].style.display = 'none'
          $('#diagnostic')[0].style.display = 'none'
          $('#predictive')[0].style.display = 'none'
          $('#prescriptive')[0].style.display = 'none'
          $('label[for="supervised"]')[0].style.display = 'none'
          $('label[for="descriptive"]')[0].style.display = 'none'
          $('label[for="diagnostic"]')[0].style.display = 'none'
          $('label[for="predictive"]')[0].style.display = 'none'
          $('label[for="prescriptive"]')[0].style.display = 'none'
          $('#algoNames')[0].style.display = 'none'
          $('#algosupervised')[0].style.display = 'none'
          $('#algoUnsupervised')[0].style.display = 'none'
          $('#AlgoReinforcement')[0].style.display = 'none'
          $('#parameter')[0].style.display = 'none'
          $('#evaluation')[0].style.display = 'none'
          $('#landmarker')[0].style.display = 'none'
          $('label[for="algoNames"]')[0].style.display = 'none'
          $('label[for="algosupervised"]')[0].style.display = 'none'
          $('label[for="algoUnsupervised"]')[0].style.display = 'none'
          $('label[for="algoReinforcement"]')[0].style.display = 'none'
        }
      }
      if (!(typeRecherche.includes("otherAnalysis")) && !(typeRecherche.includes("machineLearning"))) {
        $('#supervised')[0].style.display = 'none'
        $('#descriptive')[0].style.display = 'none'
        $('#diagnostic')[0].style.display = 'none'
        $('#predictive')[0].style.display = 'none'
        $('#prescriptive')[0].style.display = 'none'
        $('label[for="supervised"]')[0].style.display = 'none'
        $('label[for="descriptive"]')[0].style.display = 'none'
        $('label[for="diagnostic"]')[0].style.display = 'none'
        $('label[for="predictive"]')[0].style.display = 'none'
        $('label[for="prescriptive"]')[0].style.display = 'none'
        $('#algoNames')[0].style.display = 'none'
        $('#algosupervised')[0].style.display = 'none'
        $('#algoUnsupervised')[0].style.display = 'none'
        $('#AlgoReinforcement')[0].style.display = 'none'
        $('#parameter')[0].style.display = 'none'
        $('#evaluation')[0].style.display = 'none'
        $('#landmarker')[0].style.display = 'none'
        $('label[for="algoNames"]')[0].style.display = 'none'
        $('label[for="algosupervised"]')[0].style.display = 'none'
        $('label[for="algoUnsupervised"]')[0].style.display = 'none'
        $('label[for="algoReinforcement"]')[0].style.display = 'none'
      }

    }
  });

  //Event for checkbox in dropdown menu (mainly for filter)
  $('#usedOpeDropdown').on('click', 'input', function () {
    $("#processNames").empty();
    if (this.checked) {
      typeOpe.push(this.id)
      showProcesses(tagsinput, langList, pDate, typeOpe, exeEnvList);
    } else {
      const index = typeOpe.indexOf(this.id);
      if (index > -1) {
        typeOpe.splice(index, 1);
      }
      showProcesses(tagsinput, langList, pDate, typeOpe, exeEnvList);
    }
  });

  //Event for checkbox in dropdown menu (mainly for filter)
  $('#languageDropDown').on('click', 'input', function () {
    $("#processNames").empty();
    if (this.checked) {
      langList.push(this.id)
      showProcesses(tagsinput, langList, pDate, typeOpe, exeEnvList);
    } else {
      const index = langList.indexOf(this.id);
      if (index > -1) {
        langList.splice(index, 1);
      }
      showProcesses(tagsinput, langList, pDate, typeOpe, exeEnvList);
    }
  });

  //Event for checkbox in dropdown menu (mainly for filter)
  $('#exeEnvDropdown').on('click', 'input', function () {
    $("#processNames").empty();
    if (this.checked) {
      exeEnvList.push(this.id)
      showProcesses(tagsinput, langList, pDate, typeOpe, exeEnvList);
    } else {
      const index = exeEnvList.indexOf(this.id);
      if (index > -1) {
        exeEnvList.splice(index, 1);
      }
      showProcesses(tagsinput, langList, pDate, typeOpe, exeEnvList);
    }
  });

  //Event for checkbox in dropdown menu (mainly for filter)
  $('#landmarkerDropdown').on('click', 'input', function () {
    $("#analyseNames").empty();
    if (this.checked) {
      landmarkerList.push(this.id)
      $("#analyseNames").empty()
      showStudies(tagsinput, typeRecherche, aDate, landmarkerList, algoNames.value, parameterList, evaluationList);
    } else {
      const index = landmarkerList.indexOf(this.id);
      if (index > -1) {
        landmarkerList.splice(index, 1);
      }
      $("#analyseNames").empty()
      showStudies(tagsinput, typeRecherche, aDate, landmarkerList, algoNames.value, parameterList, evaluationList);
    }
  });

  //Event for checkbox in dropdown menu (mainly for filter)
  $('#parameterDropdown').on('click','input', function () {
    $("#analyseNames").empty();
    if (this.checked) {
      parameterList.push(this.id)
      $("#analyseNames").empty()
      showStudies(tagsinput, typeRecherche,aDate,landmarkerList,algoNames, parameterList, evaluationList);
    } else {
      const index = parameterList.indexOf(this.id);
      if (index > -1) {
        parameterList.splice(index, 1);
      }
      $("#analyseNames").empty()
      showStudies(tagsinput, typeRecherche,aDate,landmarkerList,algoNames, parameterList, evaluationList);
    }
  });

  //Event for checkbox in dropdown menu (mainly for filter)
  $('#evaluationDropdown').on('click', 'input', function () {
    $("#analyseNames").empty();
    if (this.checked) {
      evaluationList.push(this.id)
      $("#analyseNames").empty()
      showStudies(tagsinput, typeRecherche,aDate,landmarkerList,algoNames, parameterList, evaluationList);
    } else {
      const index = evaluationList.indexOf(this.id);
      if (index > -1) {
        evaluationList.splice(index, 1);
      }
      $("#analyseNames").empty()
      showStudies(tagsinput, typeRecherche,aDate,landmarkerList,algoNames, parameterList, evaluationList);
    }
  });

  //Event to get the date if changed for date filter
  $('#dsDate').change(function () {
    console.log($(this).val())
    clearTimeout(timer);  //clear any running timeout on key up
    timer = setTimeout(function () {
      dsDate = document.getElementById('dsDate').value;
      showDatabases(tagsinput, typeRecherche, dsDate, "", "", inputECAnames);
    }, 750);
  });

  $('#pDate').change(function () {
    $("#processNames").empty();
    clearTimeout(timer);  //clear any running timeout on key up
    timer = setTimeout(function () {
      pDate = document.getElementById('pDate').value;
      showProcesses(tagsinput, langList, pDate);
    }, 750);
  });

  $('#aDate').change(function () {
    clearTimeout(timer);  //clear any running timeout on key up
    timer = setTimeout(function () {
      aDate = document.getElementById('aDate').value;
      showStudies(tagsinput, typeRecherche, aDate, landmarkerList, algoNames.value, parameterList, evaluationList);
    }, 750);
  });


  //Event to show more filter on click
  $('#moreDS').on("click", function () {
    var display = $('#moreDSFilter')[0].style.display;
    if (display === "none") {
      $('#moreDSFilter')[0].style.display = "block";

    } else {
      $('#moreDSFilter')[0].style.display = "none";
    }
    return display;
  });

  $('#moreP').on("click", function () {
    var display = $('#morePFilter')[0].style.display;
    if (display === "none") {
      $('#morePFilter')[0].style.display = "block";
    } else {
      $('#morePFilter')[0].style.display = "none";
    }
    return display;
  });

  $('#moreA').on("click", function () {
    var display = $('#moreAFilter')[0].style.display;
    if (display === "none") {
      $('#moreAFilter')[0].style.display = "block";
    } else {
      $('#moreAFilter')[0].style.display = "none";
    }
    return display;
  });

  //Event to clear all the filter on click
  $('#clearAllFilterDS').on("click", function () {
    $('#moreDSFilter')[0].style.display = "none";
    document.getElementById('Structured').checked = false;
    document.getElementById('Semi-Structured').checked = false;
    document.getElementById('Unstructured').checked = false;
    document.getElementById('dsDate').value = "0001-01-01";
    document.getElementById('inputECANames').value = "";
    typeRecherche = [];
    dsDate = "0001-01-01T00:00:00Z";
    inputECAnames = "";
    $("#dbNames").empty();
    showDatabases(tagsinput, typeRecherche, dsDate, "", "", inputECAnames);
  });

  $('#clearAllFilterP').on("click", function () {
    $('#morePFilter')[0].style.display = "none";
    $('#languageDropDown')[0].style.display = "none";
    var elt = document.getElementsByClassName("languageList")
    for (var i = 0; i < elt.length; i++) {
      elt[i].childNodes[1].checked = false;
    }
    document.getElementById('pDate').value = "0001-01-01";

    document.getElementById("usedOpeDropdown").style.display = "none";
    document.getElementById("usedOpeClear").style.display = "none";
    document.getElementById('usedOpeInput').value = "";
    clearList("usedOpeList");

    document.getElementById("exeEnvDropdown").style.display = "none";
    document.getElementById("exeEnvClear").style.display = "none";
    document.getElementById('exeEnvInput').value = "";
    clearList("exeEnvList");

    langList = [];
    pDate = "0001-01-01";
    exeEnvList = [];
    typeOpe = [];
    $("#processNames").empty()
    showProcesses(tagsinput, langList, pDate, typeOpe, exeEnvList);
  });

  $('#clearAllFilterA').on("click", function () {
    $('#moreAFilter')[0].style.display = "none";
    var elt = document.getElementsByClassName("analysetype")
    // console.log(elt[0])
    for (x = 0; x < elt.length; x++) {
      elt[x].checked = false;
      if (x >= 2) {
        elt[x].style.display = "none";
      }
    }
    $('label[for="supervised"]')[0].style.display = 'none';
    $('label[for="descriptive"]')[0].style.display = 'none';
    $('label[for="diagnostic"]')[0].style.display = 'none';
    $('label[for="predictive"]')[0].style.display = 'none';
    $('label[for="prescriptive"]')[0].style.display = 'none';

    document.getElementById("aDate").value = "0001-01-01";

    document.getElementById("landmarkerDropdown").style.display = "none"
    document.getElementById("landmarkerClear").style.display = "none"
    document.getElementById('landmarkerInput').value = "";
    clearList("landmarkerList");

    document.getElementById("parameterDropdown").style.display = "none"
    document.getElementById("parameterClear").style.display = "none"
    document.getElementById('parameterInput').value = "";
    clearList("parameterList");

    document.getElementById("evaluationDropdown").style.display = "none"
    document.getElementById("evaluationClear").style.display = "none"
    document.getElementById('evaluationInput').value = "";
    clearList("evaluationList");

    document.getElementById("algoNames").value = ""
    var elt2 = document.getElementsByClassName("algotype")
    for (j = 0; j < elt2.length; j++) {
      elt2[j].checked = false;
    }
    landmarkerList = [];
    aDate = "0001-01-01";
    algoNames = "";
    $("#analyseNames").empty()
    showStudies(tagsinput);
  });

  //Event to show or hide filters with button
  $('#qualityLevel').on("click", function () {
    var display = $('#qualityDropdown')[0].style.display;
    if (display === "none") {
      $('#qualityDropdown')[0].style.display = "block";
    } else {
      $('#qualityDropdown')[0].style.display = "none";
    }
    return display;
  });

  $('#programLanguage').on("click", function () {
    var display = $('#languageDropDown')[0].style.display;
    console.log(display)
    if (display === "none") {
      $('#languageDropDown')[0].style.display = "block";
      //$('#languageInput')[0].style.display = "block";
    } else {
      $('#languageDropDown')[0].style.display = "none";
      //$('#languageInput')[0].style.display = "none";
    }
    return display;
  });

  $('#usedOpe').on("click", function () {
    var display = $('#usedOpeDropdown')[0].style.display;
    if (display === "none") {
      $('#usedOpeDropdown')[0].style.display = "block";
      document.getElementById("usedOpeClear").style.display = "block"
    } else {
      $('#usedOpeDropdown')[0].style.display = "none";
      document.getElementById("usedOpeClear").style.display = "none"
    }
    return display;
  });

  //for clear the chosed used operation
  $('#usedOpeClear').on("click", function () {
    a = div.getElementsByClassName("usedOpeList");
    for (i = 0; i < a.length; i++) {
      a[i].style.display = "none";
      a[i].childNodes[1].checked = false;
    }
    document.getElementById('usedOpeInput').value = "";
    typeOpe = [];
    $("#processNames").empty()
    showProcesses(tagsinput, langList, pDate, typeOpe, exeEnvList);
    console.log(typeOpe)
  });

  $('#exeEnv').on("click", function () {
    var display = $('#exeEnvDropdown')[0].style.display;
    if (display === "none") {
      $('#exeEnvDropdown')[0].style.display = "block";
      document.getElementById("exeEnvClear").style.display = "block"
    } else {
      $('#exeEnvDropdown')[0].style.display = "none";
      document.getElementById("exeEnvClear").style.display = "none"
    }
    return display;
  });

  //for clear the chosed execution Environment
  $('#exeEnvClear').on("click", function () {
    a = div.getElementsByClassName("exeEnvList");
    for (i = 0; i < a.length; i++) {
      a[i].style.display = "none";
      a[i].childNodes[1].checked = false;
    }
    document.getElementById('exeEnvInput').value = "";
    exeEnvList = [];
    $("#processNames").empty()
    showProcesses(tagsinput, langList, pDate, typeOpe, exeEnvList);
    console.log(exeEnvList)
  });

  $('#landmarker').on("click", function () {
    var display = $('#landmarkerDropdown')[0].style.display;
    if (display === "none") {
      $('#landmarkerDropdown')[0].style.display = "block";
      document.getElementById("landmarkerClear").style.display = "block"
    } else {
      $('#landmarkerDropdown')[0].style.display = "none";
      document.getElementById("landmarkerClear").style.display = "none"
    }
    return display;
  });

  //for clear the chosed landmarker
  $('#landmarkerClear').on("click", function () {
    a = div.getElementsByClassName("landmarkerList");
    for (i = 0; i < a.length; i++) {
      a[i].style.display = "none";
      a[i].childNodes[1].checked = false;
    }
    document.getElementById('landmarkerInput').value = "";
    landmarkerList = [];
    $("#analyseNames").empty()
    showStudies(tagsinput, typeRecherche, aDate, landmarkerList, algoNames.value, parameterList, evaluationList);
    console.log(landmarkerList)
  });

  $('#parameter').on("click", function () {
    var display = $('#parameterDropdown')[0].style.display;
    if (display === "none") {
      $('#parameterDropdown')[0].style.display = "block";
      document.getElementById("parameterClear").style.display = "block"
    } else {
      $('#parameterDropdown')[0].style.display = "none";
      document.getElementById("parameterClear").style.display = "none"
    }
    return display;
  });
  //for clear the chosed parameter
  $('#parameterClear').on("click", function () {
    a = div.getElementsByClassName("parameterList");
    for (i = 0; i < a.length; i++) {
      a[i].style.display = "none";
      a[i].childNodes[1].checked = false;
    }
    document.getElementById('parameterInput').value = "";
    parameterList = [];
    $("#analyseNames").empty()
    showStudies(tagsinput, typeRecherche, aDate, landmarkerList, algoNames.value, parameterList, evaluationList);
  });

  $('#evaluation').on("click", function () {
    var display = $('#evaluationDropdown')[0].style.display;
    if (display === "none") {
      $('#evaluationDropdown')[0].style.display = "block";
      document.getElementById("evaluationClear").style.display = "block"
    } else {
      $('#evaluationDropdown')[0].style.display = "none";
      document.getElementById("evaluationClear").style.display = "none"
    }
    return display;
  });
  //for clear the chosed parameter
  $('#evaluationClear').on("click", function () {
    a = div.getElementsByClassName("evaluationList");
    for (i = 0; i < a.length; i++) {
      a[i].style.display = "none";
      a[i].childNodes[1].checked = false;
    }
    document.getElementById('evaluationInput').value = "";
    evaluationList = [];
    $("#analyseNames").empty()
    showStudies(tagsinput, typeRecherche, aDate, landmarkerList, algoNames.value, parameterList, evaluationList);
    console.log(evaluationList)
  });

  //Event to search a specific filter within a list filter
  $("#qualityInput").keyup(function () {
    var input, filter, ul, li, a, i;
    input = document.getElementById("qualityInput");
    filter = input.value.toUpperCase();
    div = document.getElementById("qualityDropdown");
    a = div.getElementsByTagName("div");
    for (i = 0; i < a.length; i++) {
      txtValue = a[i].textContent || a[i].innerText;
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        a[i].style.display = "";
      } else {
        a[i].style.display = "none";
      }
    }
  });

  $("#languageInput").keyup(function () {
    var input, filter, ul, li, a, i;
    input = document.getElementById("languageInput");
    filter = input.value.toUpperCase();
    div = document.getElementById("languageDropDown");
    a = div.getElementsByTagName("tr");
    for (i = 0; i < a.length; i++) {
      txtValue = a[i].textContent || a[i].innerText;
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        a[i].style.display = "";
      } else {
        a[i].style.display = "none";
      }
    }
  });

  //Changed: for click in the drop-down
  $("#landmarkerInput").keyup(function () {
    var elt2 = document.getElementById("DropdownMenulandmarker");
    elt2.innerText = ""
    var input, filter, a, i;
    input = document.getElementById("landmarkerInput");
    filter = input.value.toUpperCase();
    div = document.getElementById("landmarkerDropdown");
    a = div.getElementsByClassName("landmarkerList");
    for (i = 0; i < a.length; i++) {
      txtValue = a[i].textContent || a[i].innerText;
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        var idlandmarker = txtValue.substr(1, txtValue.length - 1)
        elt2.insertAdjacentHTML('beforeend', "<li><a name='landmarkerLink' id='landmarker_" + idlandmarker + "'>" + idlandmarker + "</a></li>");
      }
    }
    var landmarkerLink = document.getElementsByName("landmarkerLink");
    for (j = 0; j < landmarkerLink.length; j++) {
      landmarkerLink[j].addEventListener("click", getLandmarkerClick);
    }
  });

  //Add: for click in the drop-down of used operation
  $("#usedOpeInput").keyup(function () {
    var elt2 = document.getElementById("DropdownMenuusedop");
    elt2.innerText = ""
    var input, filter, a, i;
    input = document.getElementById("usedOpeInput");
    filter = input.value.toUpperCase();
    div = document.getElementById("usedOpeDropdown");
    a = div.getElementsByClassName("usedOpeList");
    console.log(filter)
    for (i = 0; i < a.length; i++) {
      txtValue = a[i].textContent || a[i].innerText;
      var idusedop = txtValue.substr(1, txtValue.length - 1)
      if (idusedop.toUpperCase().indexOf(filter) > -1) {
        var elt2 = document.getElementById("DropdownMenuusedop");
        elt2.insertAdjacentHTML('beforeend', "<li><a name='usedOpLink' id='usedOperation_" + idusedop + "'>" + idusedop + "</a></li>");
      }
    }
    var usedOpLink = document.getElementsByName("usedOpLink");
    for (j = 0; j < usedOpLink.length; j++) {
      usedOpLink[j].addEventListener("click", getusedOperationClick);
    }
  });

  //Add: for click in the drop-down of execution environment
  $("#exeEnvInput").keyup(function () {
    var elt2 = document.getElementById("DropdownMenuexeEnv");
    elt2.innerText = ""
    var input, filter, ul, li, a, i;
    input = document.getElementById("exeEnvInput");
    filter = input.value.toUpperCase();
    div = document.getElementById("exeEnvDropdown");
    a = div.getElementsByClassName("exeEnvList");
    for (i = 0; i < a.length; i++) {
      txtValue = a[i].textContent || a[i].innerText;
      var idexeEnv = txtValue.substr(2, txtValue.length - 1)
      if (idexeEnv.toUpperCase().indexOf(filter) > -1) {
        var elt2 = document.getElementById("DropdownMenuexeEnv");
        elt2.insertAdjacentHTML('beforeend', "<li><a name='exeEnvLink' id='exeEnv_" + idexeEnv + "'>" + idexeEnv + "</a></li>");
      }
    }
    var exeEnvLink = document.getElementsByName("exeEnvLink");
    for (j = 0; j < exeEnvLink.length; j++) {
      exeEnvLink[j].addEventListener("click", getexeEnvClick);
    }
  });

  $("#evaluationInput").keyup(function () {
    var elt2 = document.getElementById("DropdownMenuevaluation");
    elt2.innerText = ""
    var input, filter, a, i;
    input = document.getElementById("evaluationInput");
    filter = input.value.toUpperCase();
    div = document.getElementById("evaluationDropdown");
    a = div.getElementsByClassName("evaluationList");
    for (i = 0; i < a.length; i++) {
      txtValue = a[i].textContent || a[i].innerText;
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        var idevaluation = txtValue.substr(1, txtValue.length - 1)
        elt2.insertAdjacentHTML('beforeend', "<li><a name='evaluationLink' id='evaluation_" + idevaluation + "'>" + idevaluation + "</a></li>");
      }
    }
    var evaluationLink = document.getElementsByName("evaluationLink");
    for (j = 0; j < evaluationLink.length; j++) {
      evaluationLink[j].addEventListener("click", getEvaluationClick);
    }
  });

  $("#parameterInput").keyup(function () {
    var elt2 = document.getElementById("DropdownMenuparameter");
    elt2.innerText = ""
    var input, filter, a, i;
    input = document.getElementById("parameterInput");
    filter = input.value.toUpperCase();
    div = document.getElementById("parameterDropdown");
    a = div.getElementsByClassName("parameterList");
    for (i = 0; i < a.length; i++) {
      txtValue = a[i].textContent || a[i].innerText;
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        var idparameter = txtValue.substr(1, txtValue.length - 1)
        elt2.insertAdjacentHTML('beforeend', "<li><a name='parameterLink' id='parameter_" + idparameter + "'>" + idparameter + "</a></li>");
      }
    }
    var parameterLink = document.getElementsByName("parameterLink");
    for (j = 0; j < parameterLink.length; j++) {
      parameterLink[j].addEventListener("click", getParameterClick);
    }

  });


  //Event to search within result of dataset or studies a specific entity linked to them
  $("#inputECANames").keyup('compositionend', function () {
    $("#dbNames").empty();
    clearTimeout(timer);  //clear any running timeout on key up
    timer = setTimeout(function () {
      inputECAnames = document.getElementById("inputECANames");
      showDatabases(tagsinput, typeRecherche, dsDate, "", "", inputECAnames);
    }, 1000);
  });

  $("#algoNames").keyup(function () {
    console.log(algoNames.value)
    $("#analyseNames").empty();
    clearTimeout(timer);  //clear any running timeout on key up
    timer = setTimeout(function () {
      algoNames = document.getElementById("algoNames");
      console.log('hello')

      showStudies(tagsinput, typeRecherche, aDate, landmarkerList, algoNames.value, parameterList, evaluationList);
    }, 1000);
  });

  $("#omNames").keyup(function () {
    $("#analyseNames").empty();
    omNames = document.getElementById("omNames");
    showStudies(tagsinput, typeRecherche, aDate, landmarkerList, algoNames.value, parameterList, evaluationList, omNames.value)
  });


});

async function showSimilarity() {
  var promisegraph = new Promise((resolve, reject) => {
    api.graphList().then(p => {
      graphListResult = p
      if (resolve !== undefined) {
        resolve();
      }
    })
  })
  promisegraph.then(() => {
    if (graphListResult.indexOf('graph-DDDT') == -1) {
      api.createGraph()
    }
  })

  promisegraph.finally(() => {
    api.algoSimilairty().then(a => {
      return a
    })
  })
}

//Function to get entity class by analyse and build a list fo result
async function showEntityClassByAnalyse(anUuid, anName) {
  $("#EntityClassNames").empty()
  api.getEntityClassByAnalyse(anName, anUuid).then(ec => {
    $listEc = $("#EntityClassNames")
    for (var i = 0; i < ec.length; i++) {
      if (optionEntityClass.indexOf(ec[i].name) === -1) {
        entityClassList.push(ec[i])
        $listEc.append("<tr><td class='EntityClass' id='" + ec[i].name + "$" + anUuid + "$" + anName + "'>" + ec[i].name + "</td></tr>")
        optionEntityClass.push(ec[i].name)
      }
    }
  }, 'json')
}

//Function to get entity class by dataset and build a list fo result
async function showEntityClassByDataset(dsId, dsName, typeDS) {
  $("#EntityClassNames").empty()
  api.getEntityClassByDataset(dsName, dsId, typeDS).then(ec => {
    optionEntityClass = [];
    $listEc = $("#EntityClassNames")
    for (var i = 0; i < ec.length; i++) {
      if (optionEntityClass.indexOf(ec[i].name) === -1) {
        entityClassList.push(ec[i])
        $listEc.append("<tr><td class='EntityClass' id='" + dsName + "$" + dsId + "$" + typeDS + "'>" + ec[i].name + "</td></tr>")
        optionEntityClass.push(ec[i].name)
      }
    }
  }, 'json')
}

//Function to get relationship value between two dataset
async function getAnalysisRelationshipDS(ds1Uuid, ds2uuid, name, dsName, ds2Name, mapRelationAttDS, resolve) {
  api
    .getRelationshipDSAnalysisbyDataset(ds1Uuid, ds2uuid, name)
    .then(p => {
      if (p !== undefined && p.length > 0) {
        mapRelationAttDS.set(dsName + '&' + ds2Name + '&' + name, parseFloat(p[0].value))
      } else {
        mapRelationAttDS.set(nameAtt + '&' + nameAtt2 + '&' + name, '');
      }
      if (resolve !== undefined) {
        resolve();
      }
    }, 'json')
}

//Function to get all dataset linked by a relation with the target
async function getDatasetOfRelationship(dsName, dsId, relationlist) {
  var promisesDS = [];
  var mapRelationAttDS = new Map;
  api
    .getRelationshipDSbyDataset(dsName, dsId, 'Dataset', relationlist)
    .then(p => {
      $listHead = $('#dataset_' + relationlist)
      for (var i = 0; i < p.length; i++) {
        if (p[i].uuid != dsId) {
          promisesDS.push(new Promise((resolve, reject) => { getAnalysisRelationshipDS(p[i].uuid, dsId, $listHead.closest('div').attr('id'), dsName, p[i].name, mapRelationAttDS, resolve); }));

        }
      }
      Promise.all(promisesDS).then(() => {
        console.log('Promise finit : ' + mapRelationAttDS.size);
        var valueMin = Math.min(...mapRelationAttDS.values())
        var valueMax = Math.max(...mapRelationAttDS.values())
        var arrayObj = Array.from(mapRelationAttDS);
        arrayObj.sort(function (a, b) { return b[1] - a[1] })
        var typerelationshipDS = ""
        for (var i = 0; i < arrayObj.length; i++) {
          $listBody = $('#dataset_' + arrayObj[i][0].split('&')[2])
          console.log(arrayObj[i][0].split('&')[2])
          typerelationshipDS = arrayObj[i][0].split('&')[2]
          if (arrayObj[i][1]) {
            var valueNumber = Number(arrayObj[i][1]).toFixed(5)
            if (arrayObj[i][1] == valueMin) {
              $listBody.append('<tr><td>' + arrayObj[i][0].split('&')[0] + ' - ' + arrayObj[i][0].split('&')[1] + ' : </td><td><span style="color : green">' + valueNumber + '</span></td></tr>')
            } else {
              if (arrayObj[i][1] == valueMax) {
                $listBody.append('<tr><td>' + arrayObj[i][0].split('&')[0] + ' - ' + arrayObj[i][0].split('&')[1] + ' : </td><td><span style="color : red">' + valueNumber + '</span></td></tr>')
              } else {
                $listBody.append('<tr><td>' + arrayObj[i][0].split('&')[0] + ' - ' + arrayObj[i][0].split('&')[1] + ' : </td><td>' + valueNumber + '</td></tr>')
              }
            }
          }
        }
        $rangeBody = $('#' + typerelationshipDS)
        var valueMaxRounding = valueMax.toFixed(5)
        var valueMinRounding = valueMin.toFixed(5)
        $rangeBody.append("</br><p><b>Threshold</b>:<span id='seuil_" + typerelationshipDS + "'></span><input type='button' id='b_" + typerelationshipDS + "' name='blue' value='Show part blue'/></p><input type='range' id='r_" + typerelationshipDS + "' value='" + valueMaxRounding + "' max='" + valueMaxRounding + "' min='" + valueMinRounding + "' step='0.00001'/><div class='row'> <div class='col-md-6'>" + valueMinRounding + "</div><div class='col-md-6'><div class='text-right'>" + valueMaxRounding + "</div></div></div>")
        document.getElementById('r_' + typerelationshipDS).addEventListener("change", getGrapheViz4Seuil)
        document.getElementById('b_' + typerelationshipDS).addEventListener("click", changRange)
        document.getElementById('b_' + typerelationshipDS).addEventListener("click", getGrapheViz4Seuil)
      });
    }, 'json')
}

//Function to draw relationshipDataset
function getGrapheViz4Seuil() {
  var value = document.getElementById('r_' + this.id.substring(2)).value;
  document.getElementById('seuil_' + this.id.substring(2)).innerHTML = value;
  if (document.getElementById('b_' + this.id.substring(2)).name == 'blue') {
    query4 = `MATCH (dl)<-[r1:withDataset]-()-[r2:hasRelationshipDataset]->(rDS:RelationshipDS),(autreDS)<-[r3:withDataset]-()-[r4:hasRelationshipDataset]->(rDS:RelationshipDS),(autreDS)<-[r5:withDataset]-(adrR)-[r6:withDataset]->(dl),(adrR)-[r7]->(rDS:RelationshipDS)
          WHERE dl.name CONTAINS '`+ datasetChosed[0] + `' and dl.uuid = '` + datasetChosed[1] + `'
          AND
          (autreDS:DLStructuredDataset OR autreDS:DLSemistructuredDataset OR autreDS:DLUnstructuredDataset) and rDS.name='`+ this.id.substring(2) + `' and round(toFloat(adrR.value),5)<=toFloat(` + value + `)
          RETURN DISTINCT dl,rDS,autreDS,adrR,r1,r2,r3,r4,r5,r6,r7`
  } else {
    query4 = `MATCH (dl)<-[r1:withDataset]-()-[r2:hasRelationshipDataset]->(rDS:RelationshipDS),(autreDS)<-[r3:withDataset]-()-[r4:hasRelationshipDataset]->(rDS:RelationshipDS),(autreDS)<-[r5:withDataset]-(adrR)-[r6:withDataset]->(dl),(adrR)-[r7]->(rDS:RelationshipDS)
          WHERE dl.name CONTAINS '`+ datasetChosed[0] + `' and dl.uuid = '` + datasetChosed[1] + `'
          AND
          (autreDS:DLStructuredDataset OR autreDS:DLSemistructuredDataset OR autreDS:DLUnstructuredDataset) and rDS.name='`+ this.id.substring(2) + `' and round(toFloat(adrR.value),5)>=toFloat(` + value + `)
          RETURN DISTINCT dl,rDS,autreDS,adrR,r1,r2,r3,r4,r5,r6,r7`
  }
  api.getGraph(query4).then(p => {
    // create an array with nodes
    var nodes = new vis.DataSet(p[p.length - 1][0]);
    // create an array with edges
    var edges = new vis.DataSet(p[p.length - 1][1]);
    console.log(p[p.length - 1][1])
    // create a network
    var container = document.getElementById("viz4");
    var data = {
      nodes: nodes,
      edges: edges,
    };
    var network = new vis.Network(container, data, options);
    network.body.emitter.emit('_dataChanged')
    network.redraw()
    network.fit()
  })
}

//Function to get relationship value between two attribute
async function getAnalysisRelationshipAtt(idsource, nameAtt, relationName, nameAtt2, mapRelationAtt, resolve) {
  var timestamp = Date.now();
  api
    .getRelationshipAttribute(idsource, nameAtt, 'relationValue', relationName, nameAtt2)
    .then(p => {
      if (p !== undefined && p.length > 0) {
        mapRelationAtt.set(nameAtt + '&' + nameAtt2 + '&' + relationName, p[0].value)
      } else {
        //mapRelationAtt.set(nameAtt + '&' + nameAtt2 + '&' + relationName, '');
      }
      if (resolve !== undefined) {
        resolve();
      }
    }, 'json')
}

//Function to get all attribute linked by a relation with the target
async function getAnalyseOfRelationship(id, relationlist) {
  var promises = [];
  var mapRelationAtt = new Map;
  api
    .getRelationshipAttribute(id, '', 'analyse', relationlist)
    .then(p => {
      $listBody = $('#attribute_' + relationlist)

      for (var i = 0; i < p.length; i++) {
        for (var j = i; j < p.length; j++) {
          if (p[j].name != p[i].name) {
            promises.push(new Promise((resolve, reject) => { getAnalysisRelationshipAtt(id, p[i].name, $listBody.closest('div').attr('id'), p[j].name, mapRelationAtt, resolve) }));
          }
        }
      }

      Promise.all(promises).then(() => {
        console.log('Promise finit : ' + mapRelationAtt.size);
        var valueMin = Math.min(...mapRelationAtt.values());
        var valueMax = Math.max(...mapRelationAtt.values());
        console.log(valueMin + ' ||| ' + valueMax)
        var arrayObj = Array.from(mapRelationAtt);
        arrayObj.sort(function (a, b) { return b[1] - a[1] })
        var typeRelation
        for (var i = 0; i < arrayObj.length; i++) {
          $listBody = $('#attribute_' + arrayObj[i][0].split('&')[2])
          typeRelation = arrayObj[i][0].split('&')[2]
          if (arrayObj[i][1]) {
            var valueNumber = Number(arrayObj[i][1]).toFixed(5)
            if (arrayObj[i][1] == valueMin) {
              $listBody.append('<tr><td>' + arrayObj[i][0].split('&')[0] + ' - ' + arrayObj[i][0].split('&')[1] + ' : </td><td><span style="color : red">' + valueNumber + '</span></td></tr>')
            } else {
              if (arrayObj[i][1] == valueMax) {
                $listBody.append('<tr><td>' + arrayObj[i][0].split('&')[0] + ' - ' + arrayObj[i][0].split('&')[1] + ' : </td><td><span style="color : green">' + valueNumber + '</span></td></tr>')
              } else {
                $listBody.append('<tr><td>' + arrayObj[i][0].split('&')[0] + ' - ' + arrayObj[i][0].split('&')[1] + ' : </td><td>' + valueNumber + '</td></tr>')
              }
            }
          }
        }
        $rangeBody = $('#' + typeRelation)
        var valueMaxRounding = valueMax.toFixed(5)
        var valueMinRounding = valueMin.toFixed(5)
        $rangeBody.append("</br><p><b>Threshold</b>:<span id='seuil_" + typeRelation + "'></span><input type='button' id='b_" + typeRelation + "' name='blue' value='Show part blue'/></p><input type='range' id='r_" + typeRelation + "' value='" + valueMaxRounding + "' max='" + valueMaxRounding + "' min='" + valueMinRounding + "' step='0.00001'/><div class='row'> <div class='col-md-6'>" + valueMinRounding + "</div><div class='col-md-6' ><div class='text-right'>" + valueMaxRounding + "</div></div></div></br>")
        document.getElementById('r_' + typeRelation).addEventListener("change", getGrapheViz5Seuil)
        document.getElementById('b_' + typeRelation).addEventListener("click", changRange)
        document.getElementById('b_' + typeRelation).addEventListener("click", getGrapheViz5Seuil)
      });
    }, 'json')
}

//Function to change the range of graph relationship
function changRange() {
  if (this.name == 'blue') {
    this.name = 'grey'
    this.value = 'Show part grey'
  } else {
    this.name = 'blue'
    this.value = 'Show part blue'
  }
}

//Function to draw relationshipAttribute
function getGrapheViz5Seuil() {
  // console.log(trans)
  var value = document.getElementById('r_' + this.id.substring(2)).value;
  document.getElementById('seuil_' + this.id.substring(2)).innerHTML = value;
  if (document.getElementById('b_' + this.id.substring(2)).name == 'blue') {
    query5 = `MATCH (dl)-[]-(e:EntityClass)-[]-(a),(a)-[r1:hasAttribute]-(AA:AnalysisAttribute)-[r2:useMeasure]-(RA:RelationshipAtt),(AA)-[r3:hasAttribute]-(a2)
                  WHERE dl.uuid = '` + trans + `'
                  AND
                  (a:NominalAttribute OR a:NumericAttribute OR a:Attribute) and RA.name='` + this.id.substring(2) + `' and round(toFloat(AA.value),5)<=toFloat(` + value + `)
                  RETURN DISTINCT a,r1,AA,r2,RA,a2,r3 union all MATCH (dl)-[]-()-[]-(e:EntityClass)-[]-(a),(a)-[r1:hasAttribute]-(AA:AnalysisAttribute)-[r2:useMeasure]-(RA:RelationshipAtt),(AA)-[r3:hasAttribute]-(a2)
                  WHERE dl.uuid = '` + trans + `'
                  AND
                  (a:NominalAttribute OR a:NumericAttribute OR a:Attribute) and RA.name='` + this.id.substring(2) + `' and round(toFloat(AA.value),5)<=toFloat(` + value + `)
                  RETURN DISTINCT a,r1,AA,r2,RA,a2,r3`
  } else {
    query5 = `MATCH (dl)-[]-(e:EntityClass)-[]-(a),(a)-[r1:hasAttribute]-(AA:AnalysisAttribute)-[r2:useMeasure]-(RA:RelationshipAtt),(AA)-[r3:hasAttribute]-(a2)
                  WHERE dl.uuid = '` + trans + `'
                  AND
                  (a:NominalAttribute OR a:NumericAttribute OR a:Attribute) and RA.name='` + this.id.substring(2) + `' and round(toFloat(AA.value),5)>=toFloat(` + value + `)
                  RETURN DISTINCT a,r1,AA,r2,RA,a2,r3 union all MATCH (dl)-[]-()-[]-(e:EntityClass)-[]-(a),(a)-[r1:hasAttribute]-(AA:AnalysisAttribute)-[r2:useMeasure]-(RA:RelationshipAtt),(AA)-[r3:hasAttribute]-(a2)
                  WHERE dl.uuid = '` + trans + `'
                  AND
                  (a:NominalAttribute OR a:NumericAttribute OR a:Attribute) and RA.name='` + this.id.substring(2) + `' and round(toFloat(AA.value),5)>=toFloat(` + value + `)
                  RETURN DISTINCT a,r1,AA,r2,RA,a2,r3`
  }
  api.getGraph(query5).then(p => {
    // create an array with nodes
    var nodes = new vis.DataSet(p[p.length - 1][0]);
    // create an array with edges
    var edges = new vis.DataSet(p[p.length - 1][1]);

    // create a network
    var container = document.getElementById("viz5");
    var data = {
      nodes: nodes,
      edges: edges,
    };
    var network = new vis.Network(container, data, options);
    network.body.emitter.emit('_dataChanged')
    network.redraw()
    network.fit()
  })
}

//function to create a list of filter
function usedOpeInit() {
  api.getOperations().then(p => {
    var $list = $("#usedOpeDropdown")
    for (var i = 0; i < p.length; i++) {
      $list.append("<div class='usedOpeList' style='display: none'> <input type='checkbox' class='usedOperation' name='usedOpe" + p[i].name + "' id='" + p[i].name + "'><label for='usedOpe" + p[i].name + "'>" + p[i].name + "</label></div>")
      //Add for drop-down menu
      var elt2 = document.getElementById("DropdownMenuusedop");
      elt2.insertAdjacentHTML('beforeend', "<li><a name='usedOpLink' id='usedOperation_" + p[i].name + "'>" + p[i].name + "</a></li>");
    }
    //click event for drop-down menu
    var usedOpLink = document.getElementsByName("usedOpLink");
    for (j = 0; j < usedOpLink.length; j++) {
      usedOpLink[j].addEventListener("click", getusedOperationClick);
    }
  }, "json");

}

//function to create a list of filter
function landmarkersInit(study = 'default') {
  api.getLandmarkers(study).then(p => {
    $("#landmarkerDropdown div").each(function () { if (optionLandmarkerList.indexOf($(this).text()) === -1) { optionLandmarkerList.push($(this).text()) } });
    var $list = $("#landmarkerDropdown")
    for (var i = 0; i < p.length; i++) {
      if (!optionLandmarkerList.includes(" " + p[i].name)) {
        $list.append("<div class='landmarkerList' style='display: none'> <input type='checkbox' class='landmarkers' name='landmarker$" + p[i].name + "' id='" + p[i].name + "'><label for='landmarker$" + p[i].name + "'>" + p[i].name + "</label></div>")
        //Add for drop-down menu
        var elt2 = document.getElementById("DropdownMenulandmarker");
        elt2.insertAdjacentHTML('beforeend', "<li><a name='landmarkerLink' id='landmarker_" + p[i].name + "'>" + p[i].name + "</a></li>");
      }
    }
    //click event for drop-down menu
    var landmarkerLink = document.getElementsByName("landmarkerLink");
    for (j = 0; j < landmarkerLink.length; j++) {
      landmarkerLink[j].addEventListener("click", getLandmarkerClick);
    }
  }, "json");

}

//function to create a list of filter
function parameterInit(study = 'default') {
  api.getParameter(study).then(p => {
    $("#parameterDropdown div").each(function () { if (optionParameterList.indexOf($(this).text()) === -1) { optionParameterList.push($(this).text()) } });
    var $list = $("#parameterDropdown")
    for (var i = 0; i < p.length; i++) {
      if (!optionParameterList.includes(" " + p[i].name)) {
        $list.append("<div class='parameterList' style='display: none'> <input type='checkbox' class='parameter' name='parameter$" + p[i].name + "' id='" + p[i].name + "' '><label for='parameter$" + p[i].name + "'>" + p[i].name + "</label></div>")
        //Add for drop-down menu
        var elt2 = document.getElementById("DropdownMenuparameter");
        elt2.insertAdjacentHTML('beforeend', "<li><a name='parameterLink' id='parameter_" + p[i].name + "'>" + p[i].name + "</a></li>");
      }
    }
    // click event for drop-down menu
    var parameterLink = document.getElementsByName("parameterLink");
    for (j = 0; j < parameterLink.length; j++) {
      parameterLink[j].addEventListener("click", getParameterClick);
    }
  }, "json");

}

//function to create a list of filter
function evaluationInit(study = 'default') {
  api.getEvaluation(study).then(p => {
    $("#evaluationDropdown div").each(function () { if (optionEvaluationList.indexOf($(this).text()) === -1) { optionEvaluationList.push($(this).text()) } });
    var $list = $("#evaluationDropdown")
    for (var i = 0; i < p.length; i++) {
      if (!optionEvaluationList.includes(" " + p[i].name)) {
        $list.append("<div class='evaluationList' style='display: none'> <input type='checkbox' class='evaluation' name='evaluation$" + p[i].name + "' id='" + p[i].name + "' '><label for='evaluation$" + p[i].name + "'>" + p[i].name + "</label></div>")
        //Add for drop-down menu
        var elt2 = document.getElementById("DropdownMenuevaluation");
        elt2.insertAdjacentHTML('beforeend', "<li><a name='evaluationLink' id='evaluation_" + p[i].name + "'>" + p[i].name + "</a></li>");
      }
    }
    // click event for drop-down menu
    var evaluationLink = document.getElementsByName("evaluationLink");
    for (j = 0; j < evaluationLink.length; j++) {
      evaluationLink[j].addEventListener("click", getEvaluationClick);
    }
  }, "json");

}

//function to create a list of filter
function languageProcessInit(tagsinput, language = "", date = "0001-01-01", type = []) {
  api.getProcesses(tagsinput, language, date, type).then(p => {
    if (p) {
      $("#languageDropDown").empty()
      var $list2 = $("#languageDropDown");
      var listLanguage = [];
      for (var i = 0; i < p.length; i++) {
        if (listLanguage.indexOf(p[i].programLanguage) === -1) {
          if (p[i].programLanguage) {
            $list2.append($("<div class='languageList'> <input type='checkbox' class='language' name='language" + p[i].programLanguage + " ' id='" + p[i].programLanguage + "'> <label for='language" + p[i].programLanguage + "'>" + p[i].programLanguage + "</label></div>"));
            listLanguage.push(p[i].programLanguage)
          }
        }
      }
    }
  }, "json");
}

//function to create a list of filter
function excutionEnvironmentInit(tagsinput, language = "", date = "0001-01-01", type = [], execuEnv = []) {
  api.getProcesses(tagsinput, language, date, type, execuEnv).then(p => {
    if (p) {
      // $("#exeEnvDropdown").empty()
      var $list2 = $("#exeEnvDropdown");
      exeEnvList = []
      console.log(p)
      for (var i = 0; i < p.length; i++) {
        if (listExeEnv.indexOf(p[i].executionEnvironment) === -1) {
          if (p[i].executionEnvironment) {
            $list2.append($("<div class='exeEnvList' style='display: none'> <input type='checkbox' class='exeEnv' name='exeEnv" + p[i].executionEnvironment + " ' id='" + p[i].executionEnvironment + "'> <label for='exeEnv" + p[i].executionEnvironment + "'>" + p[i].executionEnvironment + "</label></div>"));
            listExeEnv.push(p[i].executionEnvironment)
            //Add for drop-down menu
            var elt2 = document.getElementById("DropdownMenuexeEnv");
            elt2.insertAdjacentHTML('beforeend', "<li><a name='exeEnvLink' id='exeEnv_" + p[i].executionEnvironment + "'>" + p[i].executionEnvironment + "</a></li>");
          }
        }
      }
      //Click event for drop-down menu
      var exeEnvLink = document.getElementsByName("exeEnvLink");
      for (j = 0; j < exeEnvLink.length; j++) {
        exeEnvLink[j].addEventListener("click", getexeEnvClick);
      }
    }
  }, "json");
}

//Function to get process
function showProcesses(tags, language = "", date = "0001-01-01", type = [], execuEnv = []) {
  api
    .getProcesses(tags, language, date, type, execuEnv)
    .then(p => {
      if (p) {
        //var $list = $(".names").empty();
        var $list = $("#processNames")
        for (var i = 0; i < p.length; i++) {
          $list.append($("<tr><td class='Process' id='" + p[i].name + "$" + p[i].uuid + "'>" + p[i].name + "</td></tr>"));
        }
        console.log('nb items liste : ' + p.length)
      }
    }, "json");
}

//function to get studies
function showStudies(tags, type = [], aDate, landmarker = '', algoNames = '', parameter = [], evaluation = [], omNames = '') {
  console.log('parametre : ' + parameter + " || evaluation : " + evaluation)
  api
    .getStudies(tags, type, aDate, landmarker, algoNames, parameter, evaluation, omNames = '')
    .then(p => {
      if (p) {
        //var $list = $(".names").empty();
        var $list = $("#analyseNames")
        $list.empty()
        var landList = []
        for (var i = 0; i < p.length; i++) {
          $list.append($("<tr><td class='Study'>" + p[i].name + "</td></tr>"));
          if (!landList.includes(p[i].name)) {
            parameterInit(p[i])
            evaluationInit(p[i]);
            landmarkersInit(p[i]);
            landList.push(p[i].name);
          }
        }
        console.log('nb items liste : ' + p.length)
      }
    }, "json");
}

//function to get dataset
function showDatabases(tags, type = 'defaultValue', date = '0001-01-01T00:00:00Z', quality = "", sensitivity = "", ECANames = "") {
  api
    .getDatabases(tags, type, date, quality, sensitivity, ECANames)
    .then(p => {
      if (p) {
        //var $list = $(".names").empty();
        var $list = $("#dbNames")
        $list.empty()
        for (var i = 0; i < p.length; i++) {
          $list.append($("<tr><td class='Database' id='" + p[i].type + "$" + p[i].name + "$" + p[i].uuid + "'>" + p[i].name + "</td></tr>"));
        }
        console.log('nb items liste : ' + p.length)
      }
    }, "json");
}

//Click event with show of check box for execution environment
function getexeEnvClick() {
  var input, filter, ul, li, a, i;
  input = document.getElementById(this.id);
  filter = input.innerText.toUpperCase();
  div = document.getElementById("exeEnvDropdown");
  a = div.getElementsByClassName("exeEnvList");
  for (i = 0; i < a.length; i++) {
    txtValue = a[i].textContent || a[i].innerText;
    var idexeEnv = txtValue.substr(2, txtValue.length - 1)
    if (filter === idexeEnv.toUpperCase()) {
      a[i].style.display = "";
      a[i].firstElementChild.checked = true
      exeEnvList.push(idexeEnv)
    }
  }
  $("#processNames").empty();
  showProcesses(tagsinput, langList, pDate, typeOpe, exeEnvList);
}

//Click event with show of check box for used operation
function getusedOperationClick() {
  console.log(this.id)
  var input, filter, ul, li, a, i;
  input = document.getElementById(this.id);

  filter = input.innerText.toUpperCase();
  div = document.getElementById("usedOpeDropdown");
  a = div.getElementsByClassName("usedOpeList");
  for (i = 0; i < a.length; i++) {
    txtValue = a[i].textContent || a[i].innerText;
    var idusedop = txtValue.substr(1, txtValue.length - 1)
    if (filter === idusedop.toUpperCase()) {
      a[i].style.display = "";
      var elt = document.getElementById(idusedop)
      elt.checked = true
      typeOpe.push(idusedop)
    }
  }
  $("#processNames").empty();
  showProcesses(tagsinput, langList, pDate, typeOpe, exeEnvList);
}

//Click event with show of check box for landmarker
function getLandmarkerClick() {
  var input, filter, ul, li, a, i;
  input = document.getElementById(this.id);
  filter = input.innerText.toUpperCase();
  div = document.getElementById("landmarkerDropdown");
  a = div.getElementsByClassName("landmarkerList");
  for (i = 0; i < a.length; i++) {
    txtValue = a[i].textContent || a[i].innerText;
    var idlandmarker = txtValue.substr(1, txtValue.length - 1)
    if (filter === idlandmarker.toUpperCase()) {
      a[i].style.display = "";
      var elt = document.getElementById(idlandmarker)
      elt.checked = true
      landmarkerList.push(idlandmarker)
    }
  }
  $("#analyseNames").empty();
  showStudies(tagsinput, typeRecherche, aDate, landmarkerList, algoNames, parameterList, evaluationList);
}

//Click event with show of check box for evaluation
function getEvaluationClick() {
  var input, filter, ul, li, a, i;
  input = document.getElementById(this.id);
  filter = input.innerText.toUpperCase();
  div = document.getElementById("evaluationDropdown");
  a = div.getElementsByClassName("evaluationList");
  for (i = 0; i < a.length; i++) {
    txtValue = a[i].textContent || a[i].innerText;
    var idevaluation = txtValue.substr(1, txtValue.length - 1)
    if (filter === idevaluation.toUpperCase()) {
      a[i].style.display = "";
      var elt = document.getElementById(idevaluation)
      elt.checked = true
      evaluationList.push(idevaluation)
      //manque du code dans le cas où c'est uncheck
    }
  }
  $("#analyseNames").empty();
  showStudies(tagsinput, typeRecherche, aDate, landmarkerList, algoNames, parameterList, evaluationList);
}


//Click event with show of check box for parameter
function getParameterClick() {
  var input, filter, ul, li, a, i;
  input = document.getElementById(this.id);
  filter = input.innerText.toUpperCase();
  div = document.getElementById("parameterDropdown");
  a = div.getElementsByClassName("parameterList");
  for (i = 0; i < a.length; i++) {
    txtValue = a[i].textContent || a[i].innerText;
    var idparameter = txtValue.substr(1, txtValue.length - 1)
    if (filter === idparameter.toUpperCase()) {
      a[i].style.display = "";
      var elt = document.getElementById(idparameter)
      elt.checked = true
      parameterList.push(idparameter)
    }
  }
  $("#analyseNames").empty();
  showStudies(tagsinput, typeRecherche, aDate, landmarkerList, algoNames.value, parameterList, evaluationList)
}

//Function to draw relationDataset without condition
function getGrapheViz4Init() {
  document.getElementById("viz4").style.display = "block"
  var relationDS = this.id.substring(2)
  //query4 for dataset relationship
  query4 = `MATCH (dl)<-[r1:withDataset]-()-[r2:hasRelationshipDataset]->(rDS:RelationshipDS),(autreDS)<-[r3:withDataset]-()-[r4:hasRelationshipDataset]->(rDS:RelationshipDS),(autreDS)<-[r5:withDataset]-(adrR)-[r6:withDataset]->(dl) 
          WHERE dl.name CONTAINS '`+ datasetChosed[0] + `' and dl.uuid = '` + datasetChosed[1] + `'
          AND
          (autreDS:DLStructuredDataset OR autreDS:DLSemistructuredDataset OR autreDS:DLUnstructuredDataset) and rDS.name='`+ relationDS + `'
          RETURN DISTINCT dl,rDS,autreDS,adrR,r1,r2,r3,r4,r5,r6`
  api.getGraph(query4).then(p => {
    // create an array with nodes
    var nodes = new vis.DataSet(p[p.length - 1][0]);
    // create an array with edges
    var edges = new vis.DataSet(p[p.length - 1][1]);
    console.log(p[p.length - 1][1])
    // create a network
    var container = document.getElementById("viz4");
    var data = {
      nodes: nodes,
      edges: edges,
    };
    var network = new vis.Network(container, data, options);
    network.body.emitter.emit('_dataChanged')
    network.redraw()
    network.fit()
  })
}

//Function to draw relationAttribute without condition
function getGrapheViz5Init() {
  document.getElementById("viz5").style.display = "block"
  var relationAtt = this.id.substring(2)
  query5 = `MATCH (dl)-[]-(e:EntityClass)-[]-(a),(a)-[r1:hasAttribute]-(AA:AnalysisAttribute)-[r2:useMeasure]-(RA:RelationshipAtt),(AA)-[r3:hasAttribute]-(a2)
                  WHERE dl.uuid = '` + trans + `'
                  AND
                  (a:NominalAttribute OR a:NumericAttribute OR a:Attribute) and RA.name='` + relationAtt + `'
                  RETURN DISTINCT a,r1,AA,r2,RA,a2,r3 union all MATCH (dl)-[]-()-[]-(e:EntityClass)-[]-(a),(a)-[r1:hasAttribute]-(AA:AnalysisAttribute)-[r2:useMeasure]-(RA:RelationshipAtt),(AA)-[r3:hasAttribute]-(a2)
                  WHERE dl.uuid = '` + trans + `'
                  AND
                  (a:NominalAttribute OR a:NumericAttribute OR a:Attribute) and RA.name='` + relationAtt + `'
                  RETURN DISTINCT a,r1,AA,r2,RA,a2,r3`
  api.getGraph(query5).then(p => {
    // create an array with nodes
    var nodes = new vis.DataSet(p[p.length - 1][0]);
    // create an array with edges
    var edges = new vis.DataSet(p[p.length - 1][1]);

    // create a network
    var container = document.getElementById("viz5");
    var data = {
      nodes: nodes,
      edges: edges,
    };
    var network = new vis.Network(container, data, options);
    network.body.emitter.emit('_dataChanged')
    network.redraw()
    network.fit()
  })
}

function clearList(divname) {
  var elt2 = document.getElementsByClassName(divname);
  for (var j = 0; j < elt2.length; j++) {
    elt2[j].style.display = "none";
    elt2[j].childNodes[1].checked = false;
  }
}