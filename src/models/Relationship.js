var _ = require('lodash');

function Relationship(_node) {
  _.extend(this, _node.properties);
}
module.exports = Relationship;