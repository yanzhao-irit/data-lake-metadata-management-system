var _ = require('lodash');

function EntityClass(_node) {
  _.extend(this, _node.properties);
}
module.exports = EntityClass;