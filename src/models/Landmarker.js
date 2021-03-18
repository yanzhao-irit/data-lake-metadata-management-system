var _ = require('lodash');

function Landmarker(_node) {
  _.extend(this, _node.properties);
}
module.exports = Landmarker;