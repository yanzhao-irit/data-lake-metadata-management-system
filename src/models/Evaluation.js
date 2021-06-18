var _ = require('lodash');

function Evaluation(_node) {
  _.extend(this, _node.properties);
}
module.exports = Evaluation;