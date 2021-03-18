var _ = require('lodash');

function AnalysisEntityClass(_node) {
  _.extend(this, _node.properties);
}
module.exports = AnalysisEntityClass;