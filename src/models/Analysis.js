var _ = require('lodash');

function AnalysisClass(_node) {
  _.extend(this, _node.properties);
}
module.exports = AnalysisClass;