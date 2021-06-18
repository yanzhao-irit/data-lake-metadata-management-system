var _ = require('lodash');

function Tag(_node) {
  _.extend(this, _node.properties);
}
module.exports = Tag;