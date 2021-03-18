var _ = require('lodash');

function Attribute(_node) {
  _.extend(this, _node.properties);
}
module.exports = Attribute;