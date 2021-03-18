var _ = require('lodash');

function JobTitle(_node) {
  _.extend(this, _node.properties);
}
module.exports = JobTitle;