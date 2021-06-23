let $ = jQuery = require('jquery');
// let neo4j = require('../neo4jJs/neo4jApi')
if (typeof module === 'object') {
    var electron = require('electron');
    // Require in any additional modules that are Node.js only
    window.module = module;
    module = undefined;
  }
require('bootstrap')