var _ = require('lodash');

function Dataset(_node) {
  _.extend(this, _node.properties);
}
module.exports = Dataset;