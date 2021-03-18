var _ = require('lodash');

function QualityValue(_node) {
  _.extend(this, _node.properties);
}
module.exports = QualityValue;