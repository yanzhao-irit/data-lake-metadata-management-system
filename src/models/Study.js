var _ = require('lodash');

function Study(_node) {
  _.extend(this, _node.properties);
}
module.exports = Study;