var _ = require('lodash');

function RelationshipDS(_node) {
  _.extend(this, _node.properties);
}
module.exports = RelationshipDS;