var _ = require('lodash');

function Nodes(_node) {
  _.extend(this, _node.properties);
}
module.exports = Nodes;