var _ = require('lodash');

function ParameterSettings(_node) {
  _.extend(this, _node.properties);
}
module.exports = ParameterSettings;