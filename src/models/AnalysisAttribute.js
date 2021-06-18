var _ = require('lodash');

function AnalysisAttribute(_node) {
    _.extend(this, _node.properties);
  }
module.exports = AnalysisAttribute;