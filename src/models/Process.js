var _ = require('lodash');

function Process(_node) {
  _.extend(this, _node.properties);
}
module.exports = Process;