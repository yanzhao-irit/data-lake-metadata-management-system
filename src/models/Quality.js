var _ = require('lodash');

function Quality(_node) {
  _.extend(this, _node.properties);
}
module.exports = Quality;