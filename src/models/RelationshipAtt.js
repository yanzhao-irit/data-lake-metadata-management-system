var _ = require('lodash');

function RelationshipAtt(_node) {
  _.extend(this, _node.properties);
}
module.exports = RelationshipAtt;