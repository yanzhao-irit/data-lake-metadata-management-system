var _ = require('lodash');

function Ingest(_node) {
  _.extend(this, _node.properties);
}
module.exports = Ingest;