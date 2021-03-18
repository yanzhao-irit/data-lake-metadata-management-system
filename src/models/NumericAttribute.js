var _ = require('lodash');

function NumericAttribute(_node) {
  _.extend(this, _node.properties);
}
module.exports = NumericAttribute;