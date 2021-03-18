var _ = require('lodash');

function NumericFeature(_node) {
  _.extend(this, _node.properties);
}
module.exports = NumericFeature;