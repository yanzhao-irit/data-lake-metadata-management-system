var _ = require('lodash');

function Operation(_node) {
  _.extend(this, _node.properties);
}
module.exports = Operation;