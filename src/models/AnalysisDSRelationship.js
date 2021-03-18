var _ = require('lodash');

function AnalysisDSRelationship(_node) {
  _.extend(this, _node.properties);
}
module.exports = AnalysisDSRelationship;