var _ = require('lodash');

function DatasetSource(_node) {
  _.extend(this, _node.properties);
}
module.exports = DatasetSource;