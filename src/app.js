var api = require('./neo4jApi');
var pwd = require("../store-password.json")

//const {promisify} = require('util');
// const view = promisify(api);
// console.log(process.env.NODE_ENV) // dev
// console.log(('' + process.env.NODE_ENV).trim() === 'dev') // false
// console.log(process.env.NODE_ENV.length) 
var viz;

//Déclaration des différentes variables utilisé par des fonctions et qui doivent être stocké 
var typeRecherche = [];
var typeOpe = [];
var langList = [];
var exeEnvList = [];
var landmarkerList = [];
var optionLandmarkerList = [];
var optionParameterList = [];
var optionEvaluationList = [];
var optionEntityClass = [];
var entityClassList = [];
var dsDate = "0001-01-01";
var pDate = "0001-01-01";
var inputECAnames = "";
var algoNames = document.getElementById("algoNames");
var RelationDSArray = []
var lastSelected;


//Début des fonctions liés aux actions de l'utilisateur (évènementielles)
$(function () {
  //initialisation avec quelques fonctions d'affichage notamment pour les graphiques.
  draw()
  draw2()
  draw3()
  draw4()
  draw5()
  usedOpeInit()

  //déclaration de la variable de stockage des mots clefs
  var tagsinput = $('#tagsinput').tagsinput('items');

  //fonction on itemAdded à chaque mot clef entré, la fonction effectue 
  $("#tagsinput").on('itemAdded', function (event) {
    console.log('item added : ' + event.item);
    console.log('tagsinput : ' + tagsinput)
    //A chaque nouveau clef on réinitialise l'interface pour montrer les 3 tableaux de recherche. Et on cache l'interface des graphiques.
    $("#processNames").closest(".collapse").collapse('show');
    $("#dbNames").closest(".collapse").collapse('show');
    $("#analyseNames").closest(".collapse").collapse('show');
    $('#graphco').collapse('hide');
    //on Nettoie les collonnes pour laisser place aux nouveaux résultats des différentes requêtes (dataset, process, analyse)
    $(".names").empty()
    //On initialise les graphiques
    draw()
    draw2()
    draw3()
    draw4()
    draw5()
    //Appel des fonctions de recherche (sans filtres)
    showProcesses(tagsinput)
    showStudies(tagsinput)
    showDatabases(tagsinput)
    //Initialise les filtres qui font appels à des requêtes cypher pour être créer
    languageProcessInit(tagsinput)
    excutionEnvironmentInit(tagsinput)
    //Nettoie les interfaces d'affichage d'analyse et d'entity class au cas où ils ont été précédemment utilisé
    $(".analyse").empty();
    $("#EntityClassNames").empty()
  });

  //On refait la même chose quand on enlève un mot clef
  $("#tagsinput").on('itemRemoved', function (event) {
    console.log('item removed : ' + event.item);
    console.log('tagsinput : ' + tagsinput)
    $("#processNames").closest(".collapse").collapse('show');
    $("#dbNames").closest(".collapse").collapse('show');
    $("#analyseNames").closest(".collapse").collapse('show');
    $('#graphco').collapse('hide');
    if (!tagsinput.length == 0) {
      $(".names").empty()
      draw()
      draw2()
      draw3()
      draw4()
      draw5()
      showProcesses(tagsinput)
      showStudies(tagsinput)
      showDatabases(tagsinput)
      languageProcessInit(tagsinput, langList, pDate, typeOpe)
      excutionEnvironmentInit(tagsinput)
      $(".analyse").empty();
      $("#EntityClassNames").empty()
    }
    else {
      $(".names").empty();
      draw()
      draw2()
      draw3()
      draw4()
      draw5()
    }
  });


  //Fonction onclik du bouton pour retourner à l'interface de départ (3 tableaux) lorsqu'on est sur l'interface des graphiques.
  $('#back').on('click', function () {
    $("#processNames").closest(".collapse").collapse('show');
    $("#dbNames").closest(".collapse").collapse('show');
    $("#analyseNames").closest(".collapse").collapse('show');
    $("#graphco").collapse('hide');
    $(".analyse").empty();
    $("#EntityClassNames").empty()
  });

  //fonctions onlick sur les attributs et entity class pour afficher toutes les features les concernants
  $('.attNames').on('click', "td", function () {
    //Nettoie l'emplacement où ils sont affichées à chaque click
    $('#relationshipOnglet').empty()
    $('#relationshipContent').empty()
    //Vérifie si l'objet cliqué est bien un attribue grâce à la classe de la balise.
    if ($(this).context.className == "Attribute") {
      //Nettoie la fenètre des propriété de l'attribut au cas où des informations étaient déjà remplie.
      $('#attrProperties').empty()
      //condition pour faire la différence entre numérique et nominale
      if ($(this).attr('id').split('$')[2] = 'nominale') {
        //Appel à la foncton pour récupéré les attributs nominaux (avec le nom en premier paramètre puis l'id). Les paramètre sont récupérés depuis l'id de l'objet qui est construit de tel sorte qu'un $ séparé chaque élément.
        api.getNominalAttribute($(this).attr('id').split('$')[0], $(this).attr('id').split('$')[1]).then(a => {
          //Transformations au format JSON pour récupéré chaque paramètre de l'attribut
          json = JSON.parse(JSON.stringify(a[0]))
          //Récupère l'emplacement de l'endroit où on veut afficher les informations
          $list = $('#attrProperties')
          for (propriete in a[0]) {
            $list.append("<p>" + propriete + " : " + json[propriete] + "</p>");
          }
        })
      }
      //Si l'attribut est numerique
      if ($(this).attr('id').split('$')[2] = 'numeric') {
        api.getNumericAttribute($(this).attr('id').split('$')[0], $(this).attr('id').split('$')[1]).then(a => {
          json = JSON.parse(JSON.stringify(a[0]))
          $list = $('#attrProperties')
          for (propriete in a[0]) {
            $list.append("<p>" + propriete + " : " + json[propriete] + "</p>");
          }
        })
      }
    }

    //si l'objet est une entity class
    if ($(this).context.className == 'EntityClass') {
      $('#EntityClassProperties').empty()
      //Appel de la fonction pour récupérer les entity class par analyse 
      api.getEntityClassByAnalyse($(this).attr('id').split('$')[2], $(this).attr('id').split('$')[1]).then(ec => {
        console.log(ec)
        json = JSON.parse(JSON.stringify(ec[0]))
        $list = $('#EntityClassProperties')
        for (propriete in ec[0]) {
          $list.append("<p>" + propriete + " : " + json[propriete] + "</p>");
        }
      })
      //ou par dataset en fonction de ce qui est cliqué. 
      api.getEntityClassByDataset($(this).attr('id').split('$')[0], $(this).attr('id').split('$')[1], $(this).attr('id').split('$')[2]).then(ec => {
        console.log(ec)
        json = JSON.parse(JSON.stringify(ec[0]))
        $list = $('#EntityClassProperties')
        for (propriete in ec[0]) {
          $list.append("<p>" + propriete + " : " + json[propriete] + "</p>");
        }
      })
    }
  })


  //Fonction onclick pour les relationships d'attributs
  $('#attributeList').on('click', "td", function () {
    var relationlist = []
    $('#relationshipAttOnglet').empty()
    $('#relationshipAttContent').empty()

    //appel à la fonction pour récupérer ici les relations
    api
      .getRelationshipAttribute($(this).attr('id').split('$')[1], $(this).attr('id').split('$')[0], 'relation')
      .then(p => {
        console.log(p)
        $listTab = $('#relationshipAttOnglet')
        $listContent = $('#relationshipAttContent')
        for (var i = 0; i < p.length; i++) {
          relationlist.push(p[i].name)
          //On créer un nouvel onglet et interface de visualisation pour chaque relation, avec des ids spécifiques pour les localiser par la suite.
          $listTab.append('<li><a data-toggle="tab" href="#' + p[i].name + '">' + p[i].name + '</a></li>')
          $listContent.append(`
          <div id='`+ p[i].name + `' class="tab-pane fade">
              <table class='relationshiptable'>
                  <thead><tr id='attributeTableHead_` + p[i].name + `'><td>` + p[i].name + `</td></tr></thead>
                  <tbody id='attributeTableBody_` + p[i].name + `''></tbody>
              </table>
          </div>`)
        }
      }, 'json')

    //le setTimeOut permet d'effectuer la fonction à l'intérieur après un temps données. ça permet donc de laisser le temps à l'application de récupérer les données de la base. En attendant d'avoir une solution plus asynchrone.
    setTimeout(() => { console.log('relationlist : ' + relationlist); for (var i = 0; i < relationlist.length; i++) { getAnalyseOfRelationship($(this).attr('id').split('$')[0], $(this).attr('id').split('$')[1], relationlist[i]); } }, 500);;

    //Déclaration des query : les variables query sont des requêtes en cypher utiliser directement par l'API Neoviz pour créer des graphs.
    query5 = `MATCH (dl)-[]-(e:EntityClass)-[]-(a),(a)-[r1:hasAttribute]-(AA:AnalysisAttribute)-[r2:useMeasure]-(RA:RelationshipAtt),(AA)-[r3:hasAttribute]-(a2)
    WHERE dl.uuid = '` + $(this).attr('id').split('$')[1] + `'
    AND
    (a:NominalAttribute OR a:NumericAttribute OR a:Attribute)
    AND a.name CONTAINS '` + $(this).attr('id').split('$')[0] + `'
    RETURN DISTINCT a,r1,AA,r2,RA,a2,r3`
    console.log(query5)
    //Permet de rafraichir le graph avec la nouvelle query.
    if (query5.length > 3) {
      viz5.renderWithCypher(query5);
    } else {
      console.log("reload");
      viz5.reload();
    }
  })

  //Fonctions onclick pour tous les interfaces des 3 tableaux (dataset, process, analyse)
  $('.names').on('click', "td", function () {
    //Fonction de changement de couleurs lorsque sélectionné
    $(this)[0].style.backgroundColor = '#93e2df'
    if (lastSelected) {
      lastSelected[0].style.backgroundColor = ''
    }
    lastSelected = $(this)

    //Lorsqu'on clic sur un objet on cache toute l'interface pour n'afficher que le graph et le tableaux dont est issue l'objet
    $('.collapse').collapse('hide');
    //Le settime out est là car l'élément collapse de bootstrap ne fait pas de changement d'état direct mais passe par un intermédiaire (collapse <-> collapsing <-> collapse in)
    setTimeout(() => { $('#graphco').collapse('show'); }, 500);
    //Nettoie la fenètres des propriétés
    $("#properties").empty()

    //On sépare la suite en fonction de l'objet cliqué (dataset, process, study ou analyse)
    if ($(this).context.className == "Process") {
      //Cache les onlgets inutiles aux process
      $('#featureButton')[0].style.display = 'none';
      $('#dsRelationButton')[0].style.display = 'none';
      $('#attRelationButton')[0].style.display = 'none';
      $('#operationButton')[0].style.display = 'block';

      //Va chercher lles information concenant le process
      api
        .getProcesses([$(this).text()])
        .then(p => {
          if (p) {
            json = JSON.parse(JSON.stringify(p[0]))
            var $p = $("#properties")
            for (propriete in p[0]) {
              if (propriete == 'creationDate' || propriete == "executionDate" || propriete == 'id') {
                $p.append("<p>" + propriete + " : " + json[propriete].low + "</p>");
              } else {
                $p.append("<p>" + propriete + " : " + json[propriete] + "</p>");
              }
            }
          }
        }, "json");

      //Variable de graph
      query = "MATCH path =(m : DLStructuredDataset)<-[:targetData]-(c:Process {name:'" + $(this).text() + "'})<-[:sourceData]-(d:DLStructuredDataset) OPTIONAL MATCH (c)<-[q:hasSubprocess]-(w: Process) RETURN path, w,q"; //Process
      query2 = "MATCH path= (p:Process {name:'" + $(this).text() + "'})-[:hasSubprocess]-(t:Process) RETURN path"
      query3 = `MATCH (p:Process {name:'` + $(this).text() + `'}) 
      OPTIONAL MATCH (p)-[r3:containsOp]->(c:OperationOfProcess)<-[r4:isUsedBy]-(o:Operation)
      OPTIONAL MATCH (p)-[r5:hasSubprocess]->(p1:Process)-[r1:containsOp]->(c1:OperationOfProcess)<-[r2:isUsedBy]-(o1:Operation)
      RETURN p,r3,c,r4,o,p1,r1,c1,r2,r5,o1`
      if (query2.length > 3) {
        viz2.renderWithCypher(query2);
      } else {
        console.log("reload");
        viz2.reload();
      }
      if (query3.length > 3) {
        viz3.renderWithCypher(query3);
      } else {
        console.log("reload");
        viz3.reload();
      }

      //On affiche le tableau des process
      setTimeout(() => { $("#processNames").closest(".collapse").collapse('show') }, 500);

    } else {
      if ($(this).context.className == "Study") {
        $('#featureButton')[0].style.display = 'block';
        $('#dsRelationButton')[0].style.display = 'none';
        $('#attRelationButton')[0].style.display = 'block';
        $('#operationButton')[0].style.display = 'none';
        api
          .getStudies([$(this).text()], typeRecherche, landmarkerList, algoNames.value)
          .then(p => {
            if (p) {
              console.log(p);
              json = JSON.parse(JSON.stringify(p[0]))
              var $p = $("#properties")
              for (propriete in p[0]) {
                if (propriete == 'creationDate' || propriete == "executionDate" || propriete == 'id') {
                  $p.append("<p>" + propriete + " : " + json[propriete].low + "</p>");
                } else {
                  $p.append("<p>" + propriete + " : " + json[propriete] + "</p>");
                }
              }
            }
          }, "json");
        query = "MATCH path = shortestpath ((d:DLStructuredDataset)-[*]-(u:Study {name:'" + $(this).text() + "'})) RETURN path" //Study

        //On vient chercher les analyses liés à la Study pour les afficher
        var $list = $(this).parent()
        api
          .getAnalyses(tagsinput, '')
          .then(p => {
            if (p) {
              $("#EntityClassNames").empty()
              $list.append($("<tr class ='analyse'><td class ='analyse'>  Analyses : </td></tr>"));
              for (var i = 0; i < p.length; i++) {
                $list.append($("<tr class ='analyse'><td class ='analyse' id='" + p[i].name + "$" + p[i].uuid + "'>" + p[i].name + "</td></tr>"));
                showEntityClassByAnalyse(p[i].uuid, p[i].name)
              }
            }
          }, "json");



        setTimeout(() => { $("#analyseNames").closest(".collapse").collapse('show') }, 500);

      } else {
        if ($(this).context.className == "Database") {
          $('#featureButton')[0].style.display = 'none';
          $('#dsRelationButton')[0].style.display = 'block';
          $('#attRelationButton')[0].style.display = 'block';
          $('#operationButton')[0].style.display = 'none';

          //Nettoie les différent onglet de relation pour laisser place aux informations de l'objet cliquer
          $('#relationshipOnglet').empty()
          $('#relationshipContent').empty()
          $('#relationshipAttOnglet').empty()
          $('#relationshipAttContent').empty()
          $('#attributeList').empty()

          //on différencie le type de dataset pour les futurs requêtes
          if ((($(this).context.id).toLowerCase()).includes("semi")) {
            var typeDS = 'Semi-Structured';
          } else {
            if ((($(this).context.id).toLowerCase()).includes("un")) {
              var typeDS = 'Unstructured';
            } else {
              var typeDS = 'Structured';
            }
          }
          //Récupère les informations du dataset cliqué
          api
            .getDatabases([$(this).text()], typeDS)
            .then(p => {
              if (p) {
                console.log(p[0]);
                json = JSON.parse(JSON.stringify(p[0]))
                var $p = $("#properties")
                for (propriete in p[0]) {
                  $p.append("<p>" + propriete + " : " + json[propriete] + "</p>");
                }
                $('#EntityClassProperties').empty()
                //Appel à une fonction permettant d'afficher les entityclass (définit plus bas dans le code)
                showEntityClassByDataset(p[0].uuid, p[0].name, typeDS)
              }
            }, "json");


          var relationlist = []
          //Appel à la fonction pour chercher les relations et les afficher dans une table
          api
            .getRelationshipDSbyDataset($(this).attr('id').split('$')[1], $(this).attr('id').split('$')[2], 'RelationshipDS')
            .then(p => {
              console.log(p)
              $listTab = $('#relationshipOnglet')
              $listContent = $('#relationshipContent')
              for (var i = 0; i < p.length; i++) {
                relationlist.push(p[i].name)
                $listTab.append('<li><a data-toggle="tab" href="#' + p[i].name + '">' + p[i].name + '</a></li>')
                $listContent.append(`
                <div id='`+ p[i].name + `' class="tab-pane fade">
                    <table class='relationshiptable'>
                    <tbody id='dataset_` + p[i].name + `'><tbody>
                    </table>
                </div>`)

              }
              for(var i = 0; i<relationlist.length; i++){
                getDatasetOfRelationship($(this).attr('id').split('$')[1], $(this).attr('id').split('$')[2], relationlist[i])  
              }
            }, 'json')

          //setTimeout(() => { console.log('relationlist : ' + relationlist); for (var i = 0; i < relationlist.length; i++) { getDatasetOfRelationship($(this).attr('id').split('$')[1], $(this).attr('id').split('$')[2], relationlist[i]); } }, 500);;
          // console.log(relationlist[0])
          // setTimeout(() => { getDatasetOfRelationship($(this).attr('id').split('$')[1], $(this).attr('id').split('$')[2], relationlist[0]) }, 500);

          var relationlist = []
          $('#relationshipAttOnglet').empty()
          $('#relationshipAttContent').empty()
          api
            .getRelationshipAttribute($(this).attr('id').split('$')[2], '', 'relation')
            .then(p => {
              console.log(p)
              $listTab = $('#relationshipAttOnglet')
              $listContent = $('#relationshipAttContent')
              for (var i = 0; i < p.length; i++) {
                relationlist.push(p[i].name)
                //On créer un nouvel onglet et interface de visualisation pour chaque relation, avec des ids spécifiques pour les localiser par la suite.
                $listTab.append('<li><a data-toggle="tab" href="#' + p[i].name + '">' + p[i].name + '</a></li>')
                $listContent.append(`
                <div id='`+ p[i].name + `' class="tab-pane fade">
                    <table class='relationshiptable'>
                        <tbody id='attribute_` + p[i].name + `'><tbody>
                    </table>
                </div>`)
                // <tr id='attributeTableHead_` + p[i].name + `'><td>` + p[i].name + `</td></tr>
                //         <tr id='attributeTableBody_` + p[i].name + `''></tr>
              }
              for (var i = 0; i < relationlist.length; i++) {
                getAnalyseOfRelationship($(this).attr('id').split('$')[2], relationlist[i]);
              }
            }, 'json')

          console.log('idname : ' + $(this).context.id)
          if ((($(this).attr('id').split('$')[0]).toLowerCase()).includes("semi")) {
            //graph for Semi-structured dataset
            query = "MATCH path = shortestpath ((ds:DatasetSource)-[*]-(d:DLSemistructuredDataset {name:'" + $(this).text() + "'})) RETURN path"
            query2 = "MATCH (d:DLSemistructuredDataset {name:'" + $(this).text() + "'}) OPTIONAL MATCH (d)-[r:sourceData]->(p:Process)-[:hasSubprocess]->(j:Process) OPTIONAL MATCH (d)<-[s:targetData]-(p1:Process)-[:hasSubprocess]->(j1:Process) with d,p,p1,r,s RETURN d,p,p1,r,s"
          } else {
            if ((($(this).attr('id').split('$')[0]).toLowerCase()).includes("un")) {
              //graph for Unstructured dataset
              query = "MATCH path = shortestpath ((ds:DatasetSource)-[*]-(d:DLUnstructuredDataset {name:'" + $(this).text() + "'})) RETURN path"
              query2 = "MATCH (d:DLUnstructuredDataset {name:'" + $(this).text() + "'}) OPTIONAL MATCH (d)-[r:sourceData]->(p:Process)-[:hasSubprocess]->(j:Process) OPTIONAL MATCH (d)<-[s:targetData]-(p1:Process)-[:hasSubprocess]->(j1:Process) with d,p,p1,r,s RETURN d,p,p1,r,s"
            } else {
              query = "MATCH path = shortestpath ((ds:DatasetSource)-[*]-(d:DLStructuredDataset {name:'" + $(this).text() + "'})) RETURN path"; //dataset
              query2 = "MATCH (d:DLStructuredDataset {name:'" + $(this).text() + "'}) OPTIONAL MATCH (d)-[r:sourceData]->(p:Process)-[:hasSubprocess]->(j:Process) OPTIONAL MATCH (d)<-[s:targetData]-(p1:Process)-[:hasSubprocess]->(j1:Process) with d,p,p1,r,s RETURN d,p,p1,r,s"
            }
          }
          query4 = `MATCH (dl)<-[r1:withDataset]-()-[r2:hasRelationshipDataset]->(rDS:RelationshipDS),(autreDS)<-[r3:withDataset]-()-[r4:hasRelationshipDataset]->(rDS:RelationshipDS),(autreDS)<-[r5:withDataset]-(adrR)-[r6:withDataset]->(dl) 
          WHERE dl.name CONTAINS '`+ $(this).attr('id').split('$')[1] + `' and dl.uuid = '` + $(this).attr('id').split('$')[2] + `'
          AND
          (autreDS:DLStructuredDataset OR autreDS:DLSemistructuredDataset OR autreDS:DLUnstructuredDataset)
          RETURN DISTINCT dl,rDS,autreDS,adrR,r1,r2,r3,r4,r5,r6`
          query5 = `MATCH (dl)-[]-(e:EntityClass)-[]-(a),(a)-[r1:hasAttribute]-(AA:AnalysisAttribute)-[r2:useMeasure]-(RA:RelationshipAtt),(AA)-[r3:hasAttribute]-(a2)
            WHERE dl.uuid = '` + $(this).attr('id').split('$')[2] + `'
            AND
            (a:NominalAttribute OR a:NumericAttribute OR a:Attribute)
            RETURN DISTINCT a,r1,AA,r2,RA,a2,r3`
          console.log(query5)
          //Permet de rafraichir le graph avec la nouvelle query.
          if (query5.length > 3) {
            viz5.renderWithCypher(query5);
          } else {
            console.log("reload");
            viz5.reload();
          }
          if (query2.length > 3) {
            viz2.renderWithCypher(query2);
          } else {
            console.log("reload");
            viz2.reload();
          }
          if (query4.length > 3) {
            viz4.renderWithCypher(query4);
          } else {
            console.log("reload");
            viz4.reload();
          }

          setTimeout(() => { $("#dbNames").closest(".collapse").collapse('show') }, 500);

        } else {
          if ($(this).context.className == "analyse") {
            $('#featureButton')[0].style.display = 'block';
            $('#dsRelationButton')[0].style.display = 'none';
            $('#attRelationButton')[0].style.display = 'block';
            $('#operationButton')[0].style.display = 'none';


            $('#relationshipAttOnglet').empty()
            $('#relationshipAttContent').empty()
            $('#attributeList').empty()

            api
              .getAnalyses('', $(this).attr('id').split('$')[0], $(this).attr('id').split('$')[1])
              .then(p => {
                console.log(p)
                json = JSON.parse(JSON.stringify(p[0]))
                var $p = $("#properties")
                for (propriete in p[0]) {

                  $p.append("<p>" + propriete + " : " + json[propriete] + "</p>");
                }
              }, "json");

            setTimeout(() => { $("#analyseNames").closest(".collapse").collapse('show') }, 500);

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
            api.getNominalAttributebyAnalysis($(this).attr('id').split('$')[1]).then(na => {

              var $list = $('#AttributesNames')
              $list.append('"<tr><td><h4>Nominal Attribute</h4></td></tr>')
              console.log(na)
              for (var i = 0; i < na.length; i++) {
                console.log(na[i].name)
                $list.append("<tr><td class='Attribute' id='" + na[i].name + "$" + $(this).attr('id').split('$')[1] + "$nominal'>" + na[i].name + "</td></tr>")
              }
            }, 'json');

            api.getNumericAttributebyAnalysis($(this).attr('id').split('$')[1]).then(na => {
              var $list = $('#AttributesNames')
              $list.append('<tr><td><h4>Numeric Attribute</h4></td></tr>')
              console.log(na)
              for (var i = 0; i < na.length; i++) {
                $list.append("<tr><td class='Attribute' id='" + na[i].name + "$" + $(this).attr('id').split('$')[1] + "$numeric'>" + na[i].name + "</td></tr>")
              }
            }, 'json');

            var relationlist = []
            $('#relationshipAttOnglet').empty()
            $('#relationshipAttContent').empty()
            api
              .getRelationshipAttribute($(this).attr('id').split('$')[1], '', 'relation')
              .then(p => {
                console.log(p)
                $listTab = $('#relationshipAttOnglet')
                $listContent = $('#relationshipAttContent')
                for (var i = 0; i < p.length; i++) {
                  relationlist.push(p[i].name)
                  //On créer un nouvel onglet et interface de visualisation pour chaque relation, avec des ids spécifiques pour les localiser par la suite.
                  $listTab.append('<li><a data-toggle="tab" href="#' + p[i].name + '">' + p[i].name + '</a></li>')
                  $listContent.append(`
                <div id='`+ p[i].name + `' class="tab-pane fade">
                    <table class='relationshiptable'>
                        <tbody id='attribute_` + p[i].name + `'><tbody>
                    </table>
                </div>`)
                  // <tr id='attributeTableHead_` + p[i].name + `'><td>` + p[i].name + `</td></tr>
                  //         <tr id='attributeTableBody_` + p[i].name + `''></tr>
                }
                for (var i = 0; i < relationlist.length; i++) {
                  getAnalyseOfRelationship($(this).attr('id').split('$')[1], relationlist[i]);
                }
              }, 'json')

            query = "MATCH path = shortestpath ((d:DLStructuredDataset)-[*]-(u:AnalysisEntityClass {name:'" + $(this).attr('id').split('$')[0] + "',uuid:'" + $(this).attr('id').split('$')[1] + "'})) RETURN path" //Analyse
            query2 = `MATCH (a:AnalysisEntityClass)
            MATCH (a)<-[r1:hasAnalysis]-(s:Study)
            MATCH (a)<-[r2:evaluateAnalysisEntityClass]-(me:ModelEvaluation)-[r3:useEvaluationMeasure]->(em:EvaluationMeasure)
            WHERE
            toLower(a.name) CONTAINS toLower('`+ $(this).attr('id').split('$')[0] + `') AND a.uuid = '` + $(this).attr('id').split('$')[1] + `'
            WITH a,s,em,me,r1,r2,r3
            OPTIONAL MATCH (a)-[r4:hasImplementation]-(ld:Landmarker)
            WITH a,s,em,me,ld,r1,r2,r3,r4
            OPTIONAL MATCH (a)-[r5:hasImplementation]->(i:Implementation)-[r6:usesAlgo]->(al:AlgoSupervised),(a)-[r7:hasParameterSetting]->(ps:ParameterSetting)<-[r8:hasParameterValue]-(p:Parameter)<-[r9:hasParameter]-(i)
            RETURN a,s,me,em,ld,i,al,p,ps,r1,r2,r3,r4,r5,r6,r7,r8,r9`
            query5 = `MATCH (dl)-[]-(e:EntityClass)-[]-(a),(a)-[r1:hasAttribute]-(AA:AnalysisAttribute)-[r2:useMeasure]-(RA:RelationshipAtt),(AA)-[r3:hasAttribute]-(a2)
            WHERE dl.uuid = '` + $(this).attr('id').split('$')[1] + `'
            AND
            (a:NominalAttribute OR a:NumericAttribute OR a:Attribute)
            RETURN DISTINCT a,r1,AA,r2,RA,a2,r3`
            console.log(query5)
            //Permet de rafraichir le graph avec la nouvelle query.
            if (query5.length > 3) {
              viz5.renderWithCypher(query5);
            } else {
              console.log("reload");
              viz5.reload();
            }
            if (query2.length > 3) {
              viz2.renderWithCypher(query2);
            } else {
              console.log("reload");
              viz2.reload();
            }
          }
        }
      }
    }
    console.log(query);
    if (query.length > 3) {
      viz.renderWithCypher(query);
    } else {
      console.log("reload");
      viz.reload();
    }

  });

  $('#filter :checkbox').change(function () {
    // this will contain a reference to the checkbox   
    if (this.checked) {
      //console.log(this.id);
      typeRecherche.push(this.id);
      console.log("cases cochées : " + typeRecherche);
      //$(".names").empty()
      //for (var i = 0; i < typeRecherche.length; i++) {
      if (typeRecherche.includes("Structured") || typeRecherche.includes("Semi-Structured") || typeRecherche.includes("Unstructured")) {
        console.log(typeRecherche)
        $("#dbNames").empty()
        showDatabases(tagsinput, typeRecherche)
      }
      if (typeRecherche.includes("supervised") || typeRecherche.includes("descriptive") || typeRecherche.includes("diagnostic") || typeRecherche.includes("predictive") || typeRecherche.includes("prescriptive")) {
        console.log(typeRecherche)
        $("#analyseNames").empty()
        //showStudies(tagsinput, typeRecherche[i]);
        showStudies(tagsinput, typeRecherche);
      }
      if (typeRecherche.includes("algosupervised") || typeRecherche.includes("algoUnsupervised") || typeRecherche.includes("algoReinforcement")) {
        $("#analyseNames").empty()
        console.log('typeRecherche[i]' + typeRecherche);
        showStudies(tagsinput, typeRecherche);
      }
      //}
      // the checkbox is now checked 
    } else {
      console.log(this.id);
      const index = typeRecherche.indexOf(this.id);
      if (index > -1) {
        typeRecherche.splice(index, 1);
      }
      console.log(typeRecherche);
      // the checkbox is now no longer checked
      $(".names").empty()
      if (typeRecherche.length == 0) {
        console.log("pas de cases cochées")
        showProcesses(tagsinput)
        showStudies(tagsinput)
        showDatabases(tagsinput)
      }
      else {
        //for (var i = 0; i < typeRecherche.length; i++) {
        if (typeRecherche.includes("Structured") || typeRecherche.includes("Semi-Structured") || typeRecherche.includes("Unstructured")) {
          console.log(typeRecherche)
          $("#dbNames").empty()
          showDatabases(tagsinput, typeRecherche)
        }
        if (typeRecherche.includes("supervised") || typeRecherche.includes("descriptive") || typeRecherche.includes("diagnostic") || typeRecherche.includes("predictive") || typeRecherche.includes("prescriptive")) {
          console.log(typeRecherche)
          $("#analyseNames").empty()
          //showStudies(tagsinput, typeRecherche[i]);
          showStudies(tagsinput, typeRecherche);
        }
        if (typeRecherche.includes("algosupervised") || typeRecherche.includes("algoUnsupervised") || typeRecherche.includes("algoReinforcement")) {
          $("#analyseNames").empty()
          console.log('typeRecherche[i]' + typeRecherche);
          showStudies(tagsinput, typeRecherche);
        }
        //}
      }
    }
  });

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
    console.log(typeOpe);
  });
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
    console.log(langList);
  });
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
    console.log(exeEnvList);
  });
  $('#landmarkerDropdown').on('click', 'input', function () {
    $("#analyseNames").empty();
    if (this.checked) {
      landmarkerList.push(this.id)
      showStudies(tagsinput, typeRecherche, landmarkerList);
    } else {
      const index = landmarkerList.indexOf(this.id);
      if (index > -1) {
        landmarkerList.splice(index, 1);
      }
      showStudies(tagsinput, typeRecherche, landmarkerList);
    }
    console.log(landmarkerList);
  });

  $('#dsDate').change(function () {
    console.log($(this).val());
    dsDate = $(this).val();
    showDatabases(tagsinput, '', dsDate);
  });

  $('#pDate').change(function () {
    $("#processNames").empty();
    console.log($(this).val());
    pDate = $(this).val();
    showProcesses(tagsinput, langList, pDate);
  });



  $('#moreDS').on("click", function () {
    //$('#moreDB').innerHTML = 'less';
    var display = $('#moreDSFilter')[0].style.display;
    if (display === "none") {
      $('#moreDSFilter')[0].style.display = "block";
    } else {
      $('#moreDSFilter')[0].style.display = "none";
    }
    return display;
  });

  $('#moreP').on("click", function () {
    //$('#moreDB').innerHTML = 'less';
    var display = $('#morePFilter')[0].style.display;
    if (display === "none") {
      $('#morePFilter')[0].style.display = "block";
    } else {
      $('#morePFilter')[0].style.display = "none";
    }
    return display;
  });

  $('#moreA').on("click", function () {
    //$('#moreDB').innerHTML = 'less';
    var display = $('#moreAFilter')[0].style.display;
    if (display === "none") {
      $('#moreAFilter')[0].style.display = "block";
    } else {
      $('#moreAFilter')[0].style.display = "none";
    }
    return display;
  });

  $('#qualityLevel').on("click", function () {
    var display = $('#qualityDropdown')[0].style.display;
    if (display === "none") {
      $('#qualityDropdown')[0].style.display = "block";
    } else {
      $('#qualityDropdown')[0].style.display = "none";
    }
    return display;
  });

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

  $("#inputECANames").keyup(function () {
    $("#dbNames").empty();
    inputECAnames = document.getElementById("inputECANames");
    console.log(inputECAnames.value)
    showDatabases(tagsinput, "", dsDate, "", "", inputECAnames.value)
  });

  $("#algoNames").keyup(function () {
    $("#analyseNames").empty();
    algoNames = document.getElementById("algoNames");
    console.log(algoNames.value)
    showStudies(tagsinput, typeRecherche, landmarkerList, algoNames.value)
  });

  $("#omNames").keyup(function () {
    $("#analyseNames").empty();
    omNames = document.getElementById("omNames");
    console.log(omNames.value)
    showStudies(tagsinput, typeRecherche, landmarkerList, algoNames.value, omNames.value)
  });

  $('#programmationLanguage').on("click", function () {
    var display = $('#languageDropDown')[0].style.display;
    if (display === "none") {
      $('#languageDropDown')[0].style.display = "block";
      $('#languageInput')[0].style.display = "block";
    } else {
      $('#languageDropDown')[0].style.display = "none";
      $('#languageInput')[0].style.display = "none";
    }
    return display;
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

  $("#landmarkerInput").keyup(function () {
    var input, filter, ul, li, a, i;
    input = document.getElementById("landmarkerInput");
    filter = input.value.toUpperCase();
    div = document.getElementById("landmarkerDropdown");
    a = div.getElementsByClassName("landmarkerList");
    for (i = 0; i < a.length; i++) {
      txtValue = a[i].textContent || a[i].innerText;
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        a[i].style.display = "";
      } else {
        a[i].style.display = "none";
      }
    }
  });

  $("#evaluationInput").keyup(function () {
    var input, filter, ul, li, a, i;
    input = document.getElementById("evaluationInput");
    filter = input.value.toUpperCase();
    div = document.getElementById("evaluationDropdown");
    a = div.getElementsByClassName("evaluationList");
    for (i = 0; i < a.length; i++) {
      txtValue = a[i].textContent || a[i].innerText;
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        a[i].style.display = "";
      } else {
        a[i].style.display = "none";
      }
    }
  });

  $("#parameterInput").keyup(function () {
    var input, filter, ul, li, a, i;
    input = document.getElementById("parameterInput");
    filter = input.value.toUpperCase();
    div = document.getElementById("parameterDropdown");
    a = div.getElementsByClassName("parameterList");
    for (i = 0; i < a.length; i++) {
      txtValue = a[i].textContent || a[i].innerText;
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        a[i].style.display = "";
      } else {
        a[i].style.display = "none";
      }
    }
  });


  $('#usedOpe').on("click", function () {
    var display = $('#usedOpeDropdown')[0].style.display;
    if (display === "none") {
      $('#usedOpeDropdown')[0].style.display = "block";
    } else {
      $('#usedOpeDropdown')[0].style.display = "none";
    }
    return display;
  });

  $('#exeEnv').on("click", function () {
    var display = $('#exeEnvDropdown')[0].style.display;
    if (display === "none") {
      $('#exeEnvDropdown')[0].style.display = "block";
    } else {
      $('#exeEnvDropdown')[0].style.display = "none";
    }
    return display;
  });

  $('#landmarker').on("click", function () {
    var display = $('#landmarkerDropdown')[0].style.display;
    if (display === "none") {
      $('#landmarkerDropdown')[0].style.display = "block";
    } else {
      $('#landmarkerDropdown')[0].style.display = "none";
    }
    return display;
  });

  $('#parameter').on("click", function () {
    var display = $('#parameterDropdown')[0].style.display;
    if (display === "none") {
      $('#parameterDropdown')[0].style.display = "block";
    } else {
      $('#parameterDropdown')[0].style.display = "none";
    }
    return display;
  });

  $('#evaluation').on("click", function () {
    var display = $('#evaluationDropdown')[0].style.display;
    if (display === "none") {
      $('#evaluationDropdown')[0].style.display = "block";
    } else {
      $('#evaluationDropdown')[0].style.display = "none";
    }
    return display;
  });

});

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

async function getAnalysisRelationshipDS(ds1Uuid, ds2uuid, name, dsName, ds2Name ,mapRelationAttDS, resolve) {
  api
    .getRelationshipDSAnalysisbyDataset(ds1Uuid, ds2uuid, name)
    .then(p => {
      // $listBody = $('#dataset_' + name)
      // console.log(p[0].value)
      // $listBody.append('<td>' + p[0].value + '</td>')
      if (p !== undefined && p.length > 0) {
        console.log('key : ' + dsName + '&' + ds2Name + '&' + name + ' ||| value : ' + p[0].value)
        mapRelationAttDS.set(dsName + '&' + ds2Name + '&' + name, p[0].value)
      } else {
        mapRelationAttDS.set(nameAtt + '&' + nameAtt2 + '&' + name, '');
      }
      if (resolve !== undefined) {
        resolve();
      }
    }, 'json')
}

async function getDatasetOfRelationship(dsName, dsId, relationlist) {
  var promisesDS = [];
  var mapRelationAttDS = new Map;
  api
    .getRelationshipDSbyDataset(dsName, dsId, 'Dataset', relationlist)
    .then(p => {
      $listHead = $('#dataset_' + relationlist)
      console.log($listHead)
      for (var i = 0; i < p.length; i++) {
        if (p[i].uuid != dsId) {
          //$listHead.append('<td id="collumn$' + p[i].uuid + '$' + $listHead.closest('div').attr('id') + '">' + p[i].name + '</td>')
          //mapRelationAttDS.set(dsName + '&' + p[i].name + '&' + relationlist, '')
          promisesDS.push(new Promise ((resolve, reject) => {getAnalysisRelationshipDS(p[i].uuid, dsId, $listHead.closest('div').attr('id'), dsName, p[i].name,mapRelationAttDS, resolve); }));
          
        }
      }
      Promise.all(promisesDS).then(() => {
        console.log('Promise finit : ' + mapRelationAttDS.size);
        for (var [key, value] of mapRelationAttDS) {
          console.log('HashMap : ' + key + ' = ' + value)
          $listBody = $('#dataset_' + key.split('&')[2])
          if (value) {
            $listBody.append('<p>' + key.split('&')[0] + ' - ' + key.split('&')[1] + ' : ' + value + '</p>')
          }
        }
      });
      // $listBody.append('<td></td>')
      // for (var i = 0; i < p.length; i++) {
      //   if (p[i].uuid != dsId) {
      //     getAnalysisRelationshipDS(p[i].uuid, dsId, $listHead.closest('div').attr('id'));
      //   }
      // }
    }, 'json')
  //}
}

async function getAnalysisRelationshipAtt(idsource, nameAtt, relationName, nameAtt2, mapRelationAtt, resolve) {
  var timestamp = Date.now();
  api
    .getRelationshipAttribute(idsource, nameAtt, 'relationValue', relationName, nameAtt2)
    .then(p => {
      if (p !== undefined && p.length > 0) {
        console.log('key : ' + nameAtt + '&' + nameAtt2 + '&' + relationName + ' ||| value : ' + p[0].value)
        mapRelationAtt.set(nameAtt + '&' + nameAtt2 + '&' + relationName, p[0].value)
      } else {
        mapRelationAtt.set(nameAtt + '&' + nameAtt2 + '&' + relationName, '');
      }
      if (resolve !== undefined) {
        resolve();
      }
    }, 'json')
}

async function getAnalyseOfRelationship(id, relationlist) {
  var promises = [];
  var mapRelationAtt = new Map;
  api
    .getRelationshipAttribute(id, '', 'analyse', relationlist)
    .then(p => {
      //$listHead = $('#attributeTableHead_' + relationlist)
      $listBody = $('#attribute_' + relationlist)
      console.log(p)
      //console.log('Test : ' +p[0])
      for (var i = 0; i < p.length; i++) {
        for (var j = i; j < p.length; j++) {
          if (p[j].name != p[i].name) {
            //$listBody.append('<td id="collumn$' + p[i].uuid + '$' + p[j].uuid + '$' + $listBody.closest('div').attr('id') + '">' + p[i].name + '-' + p[j].name + '</td>')
            //console.log(timestamp + ' : ' + p[i].name + '&' + p[j].name + '&' + relationlist)

            promises.push(new Promise((resolve, reject) => { getAnalysisRelationshipAtt(id, p[i].name, $listBody.closest('div').attr('id'), p[j].name, mapRelationAtt, resolve) }));

          }
        }
      }

      Promise.all(promises).then(() => {
        console.log('Promise finit : ' + mapRelationAtt.size);
        for (var [key, value] of mapRelationAtt) {
          console.log('HashMap : ' + key + ' = ' + value)
          $listBody = $('#attribute_' + key.split('&')[2])
          if (value) {
            $listBody.append('<p>' + key.split('&')[0] + ' - ' + key.split('&')[1] + ' : ' + value + '</p>')
          }
        }
      });
    }, 'json')
}

function showUser() {
  api
    .getUser()
    .then(user => {
      if (!user) return;
      console.log('user : ' + user.properties.lastName)
      $("#lastName").text(user.properties.lastName);
    }, "json");
}


function search() {
  var query = $("#search").find("input[name=search]").val();
  console.log("requete : " + query)
  api
    .getProcess(query)
    .then(p => {
      if (!p) return;
      showProcess(query)
    })
}
function usedOpeInit() {
  api.getOperations().then(p => {
    var $list = $("#usedOpeDropdown")
    for (var i = 0; i < p.length; i++) {
      $list.append("<div class='usedOpeList'> <input type='checkbox' classe='usedOperation' name='usedOpe" + p[i].name + "' id='" + p[i].name + "' '><label for='usedOpe" + p[i].name + "'>" + p[i].name + "</label></div>")
    }
  }, "json");
}

function landmarkersInit(study = 'default') {
  api.getLandmarkers(study).then(p => {
    $("#landmarkerDropdown div").each(function () { if (optionLandmarkerList.indexOf($(this).text()) === -1) { optionLandmarkerList.push($(this).text()) } });
    var $list = $("#landmarkerDropdown")
    for (var i = 0; i < p.length; i++) {
      if (!optionLandmarkerList.includes(" " + p[i].name)) {
        $list.append("<div class='landmarkerList'> <input type='checkbox' classe='landmarkers' name='landmarker$" + p[i].name + "' id='" + p[i].name + "' '><label for='landmarker$" + p[i].name + "'>" + p[i].name + "</label></div>")
      }
    }
  }, "json");
}

function parameterInit(study = 'default') {
  api.getParameter(study).then(p => {
    $("#parameterDropdown div").each(function () { if (optionParameterList.indexOf($(this).text()) === -1) { optionParameterList.push($(this).text()) } });
    var $list = $("#parameterDropdown")
    for (var i = 0; i < p.length; i++) {
      if (!optionParameterList.includes(" " + p[i].name)) {
        $list.append("<div class='parameterList'> <input type='checkbox' classe='parameter' name='parameter$" + p[i].name + "' id='" + p[i].name + "' '><label for='parameter$" + p[i].name + "'>" + p[i].name + "</label></div>")
      }
    }
  }, "json");
}


function evaluationInit(study = 'default') {
  api.getEvaluation(study).then(p => {
    $("#evaluationDropdown div").each(function () { if (optionEvaluationList.indexOf($(this).text()) === -1) { optionEvaluationList.push($(this).text()) } });
    var $list = $("#evaluationDropdown")
    for (var i = 0; i < p.length; i++) {
      if (!optionEvaluationList.includes(" " + p[i].name)) {
        $list.append("<div class='evaluationList'> <input type='checkbox' classe='evaluation' name='evaluation$" + p[i].name + "' id='" + p[i].name + "' '><label for='evaluation$" + p[i].name + "'>" + p[i].name + "</label></div>")
      }
    }
  }, "json");
}

function languageProcessInit(tagsinput, language = "", date = "0001-01-01", type = []) {
  api.getProcesses(tagsinput, language, date, type).then(p => {
    if (p) {
      $("#languageDropDown").empty()
      var $list2 = $("#languageDropDown");
      var listLanguage = [];
      for (var i = 0; i < p.length; i++) {
        if (listLanguage.indexOf(p[i].programmationLanguage) === -1) {
          $list2.append($("<div class='languageList'> <input type='checkbox' classe='language' name='language" + p[i].programmationLanguage + " ' id='" + p[i].programmationLanguage + "'> <label for='language" + p[i].programmationLanguage + "'>" + p[i].programmationLanguage + "</label></div>"));
          listLanguage.push(p[i].programmationLanguage)
        }
      }
    }
  }, "json");
}

function excutionEnvironmentInit(tagsinput, language = "", date = "0001-01-01", type = [], execuEnv = []) {
  api.getProcesses(tagsinput, language, date, type, execuEnv).then(p => {
    if (p) {
      $("#exeEnvDropdown").empty()
      var $list2 = $("#exeEnvDropdown");
      var listexeEnv = [];
      for (var i = 0; i < p.length; i++) {
        if (listexeEnv.indexOf(p[i].executionEnvironment) === -1) {
          $list2.append($("<div class='languageList'> <input type='checkbox' classe='language' name='language" + p[i].executionEnvironment + " ' id='" + p[i].executionEnvironment + "'> <label for='language" + p[i].executionEnvironment + "'>" + p[i].executionEnvironment + "</label></div>"));
          listexeEnv.push(p[i].executionEnvironment)
        }
      }
    }
  }, "json");
}

function showProcesses(tags, language = "", date = "0001-01-01", type = [], execuEnv = []) {
  api
    .getProcesses(tags, language, date, type, execuEnv)
    .then(p => {
      if (p) {
        //var $list = $(".names").empty();
        var $list = $("#processNames")
        for (var i = 0; i < p.length; i++) {
          $list.append($("<tr><td class='Process' id='" + p[i].name + "$" + p[i].id + "'>" + p[i].name + "</td></tr>"));
        }
        console.log('nb items liste : ' + p.length)
      }
    }, "json");
}

function showStudies(tags, type = '', landmarker = '', algoNames = '', omNames = '') {
  api
    .getStudies(tags, type, landmarker, algoNames, omNames = '')
    .then(p => {
      if (p) {
        //var $list = $(".names").empty();
        var $list = $("#analyseNames")
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

function showDatabases(tags, type = 'defaultValue', date = '0001-01-01', quality = "", sensitivity = "", ECANames = "") {
  api
    .getDatabases(tags, type, date, quality, sensitivity, ECANames)
    .then(p => {
      if (p) {
        //var $list = $(".names").empty();
        var $list = $("#dbNames")
        for (var i = 0; i < p.length; i++) {
          $list.append($("<tr><td class='Database' id='" + p[i].type + "$" + p[i].name + "$" + p[i].uuid + "'>" + p[i].name + "</td></tr>"));
        }
        console.log('nb items liste : ' + p.length)
      }
    }, "json");
}



function draw() {
  var config = {
    container_id: "viz",
    server_url: "bolt://localhost",
    server_user: "neo4j",
    server_password: pwd.password,
    labels: {
      "Process": {
        caption: "name",
        font: {
          "size": 26,
          "color": "#000000"
        },
      },

      "DLStructuredDataset": {
        caption: "name",
      },

      "sourceData": {
        caption: "name",
      },

      "AnalysisEntityClass": {
        caption: "name",
      },

      "DLStructuredDataset": {
        caption: "name",
      },
      "Study": {
        caption: "name",
      },
      "EntityClass": {
        caption: "name",
      }
    },
    arrows: true
  }

  viz = new NeoVis.default(config);
  viz.render();
}

function draw2() {
  var config = {
    container_id: "viz2",
    server_url: "bolt://localhost",
    server_user: "neo4j",
    server_password: pwd.password,
    labels: {
      "Process": {
        caption: "name",
        font: {
          "size": 26,
          "color": "#000000"
        },
      },

      "DLStructuredDataset": {
        caption: "name",
      },

      "sourceData": {
        caption: "name",
      },

      "AnalysisEntityClass": {
        caption: "name",
        font: {
          "size": 26,
          "color": "#7be141"
        },
      },

      "DLStructuredDataset": {
        caption: "name",
      },

      "EvaluationMeasure": {
        caption: "name",
        font: {
          "size": 26,
          "color": "#d2e5ff"
        },
      },

      "ModelEvaluation": {
        caption: "value",
        font: {
          "size": 26,
          "color": "#ab83e1"
        },
      },

      "Landmarker": {
        caption: "name",
      },

      "Implementation": {
        caption: "name",
      },

      "AlgoSupervised": {
        caption: "name",
      },

      "Study": {
        caption: "name",
      },

      "Parameter": {
        caption: "name",
        font: {
          "size": 25,
          "color": "##f87d7f"
        },
      },

      "ParameterSetting": {
        caption: "value",
        font: {
          "size": 25,
          "color": "#e87cf1"
        },
      }
    },
    arrows: true
  }
  viz2 = new NeoVis.default(config);
  viz2.render();
}

function draw3() {
  var config = {
    container_id: "viz3",
    server_url: "bolt://localhost",
    server_user: "neo4j",
    server_password: pwd.password,
    labels: {
      "Process": {
        caption: "name",
        font: {
          "size": 26,
          "color": "#000000"
        },
      },

      "Operation": {
        caption: "name",
      },

      "OperationOfProcess": {
        caption: "label",
      }
    },
    arrows: true
  }
  viz3 = new NeoVis.default(config);
  viz3.render();
}

function draw4() {
  var config = {
    container_id: "viz4",
    server_url: "bolt://localhost",
    server_user: "neo4j",
    server_password: pwd.password,
    labels: {
      "RelationshipDS": {
        caption: "name",
      },
      "AnalysisDSRelatinship": {
        caption: "value",
      },
      "DLStructuredDataset": {
        caption: "name",
      },
      "DLSemistructuredDataset": {
        caption: "name",
      },
      "DLUnstructuredDataset": {
        caption: "name"
      }
    },
    arrows: true
  }
  viz4 = new NeoVis.default(config);
  viz4.render();
}
function draw5() {
  var config = {
    container_id: "viz5",
    server_url: "bolt://localhost",
    server_user: "neo4j",
    server_password: pwd.password,
    labels: {
      "NominalAttribute": {
        caption: "name",
      },
      "AnalysisAttribute": {
        caption: "value",
      },
      "NumericAttribute": {
        caption: "name",
      },
      "RelationshipAtt": {
        caption: "name",
      },
      "DLUnstructuredDataset": {
        caption: "name"
      }
    },
    arrows: true
  }
  viz5 = new NeoVis.default(config);
  viz5.render();
}
  // var config = {
  //   container_id: "viz2",
  //   server_url: "bolt://localhost",
  //   server_user: "neo4j",
  //   server_password: pwd.password,
  //   labels: {
  //     "Troll": {
  //       caption: "user_key",
  //       size: "pagerank",
  //       community: "community"
  //     }
  //   },
  //   initial_cypher: "MATCH (n:User) WHERE n.lastName = 'Dupont' RETURN n"
  // }

  // viz2 = new NeoVis.default(config);
  // viz2.render();


/*$(function () {
  renderGraph();
  search();

  $("#search").submit(e => {
    e.preventDefault();
    search();
  });
});

function showMovie(title) {
  api
    .getMovie(title)
    .then(movie => {
      if (!movie) return;

      $("#title").text(movie.title);
      $("#poster").attr("src","https://neo4j-documentation.github.io/developer-resources/language-guides/assets/posters/"+encodeURIComponent(movie.title)+".jpg");
      var $list = $("#crew").empty();
      movie.cast.forEach(cast => {
        $list.append($("<li>" + cast.name + " " + cast.job + (cast.job === "acted" ? " as " + cast.role : "") + "</li>"));
      });
    }, "json");
}

function search() {
  var query = $("#search").find("input[name=search]").val();
  api
    .searchMovies(query)
    .then(movies => {
      var t = $("table#results tbody").empty();

      if (movies) {
        movies.forEach(movie => {
          $("<tr><td class='movie'>" + movie.title + "</td><td>" + movie.released + "</td><td>" + movie.tagline + "</td></tr>").appendTo(t)
            .click(function() {
              showMovie($(this).find("td.movie").text());
            })
        });

        var first = movies[0];
        if (first) {
          showMovie(first.title);
        }
      }
    });
}

function renderGraph() {
  var width = 800, height = 800;
  var force = d3.layout.force()
    .charge(-200).linkDistance(30).size([width, height]);

  var svg = d3.select("#graph").append("svg")
    .attr("width", "100%").attr("height", "100%")
    .attr("pointer-events", "all");

  api
    .getGraph()
    .then(graph => {
      force.nodes(graph.nodes).links(graph.links).start();

      var link = svg.selectAll(".link")
        .data(graph.links).enter()
        .append("line").attr("class", "link");

      var node = svg.selectAll(".node")
        .data(graph.nodes).enter()
        .append("circle")
        .attr("class", d => {
          return "node " + d.label
        })
        .attr("r", 10)
        .call(force.drag);

      // html title attribute
      node.append("title")
        .text(d => {
          return d.title;
        });

      // force feed algo ticks
      force.on("tick", () => {
        link.attr("x1", d => {
          return d.source.x;
        }).attr("y1", d => {
          return d.source.y;
        }).attr("x2", d => {
          return d.target.x;
        }).attr("y2", d => {
          return d.target.y;
        });

        node.attr("cx", d => {
          return d.x;
        }).attr("cy", d => {
          return d.y;
        });
      });
    });
}*/