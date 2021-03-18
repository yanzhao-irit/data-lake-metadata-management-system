var _ = require('lodash');

function DLStructuredDataset(_node) {
  _.extend(this, _node.properties);
}
module.exports = DLStructuredDataset;