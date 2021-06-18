var _ = require('lodash');

function NominalFeature(_node) {
  _.extend(this, _node.properties);
}
module.exports = NominalFeature;