var _ = require('lodash');

function Parameter(_node) {
  _.extend(this, _node.properties);
}
module.exports = Parameter;