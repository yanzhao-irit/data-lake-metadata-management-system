var _ = require('lodash');

function Processes(_node) {
  _.extend(this, _node.properties);
}
module.exports = Processes;