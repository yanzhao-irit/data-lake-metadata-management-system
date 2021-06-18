var _ = require('lodash');

function NominalAttribute(_node) {
    _.extend(this, _node.properties);
  }
module.exports = NominalAttribute;