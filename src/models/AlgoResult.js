var _ = require('lodash');

function AlgoResult(_node) {
    _.extend(this, _node.properties);
  }
module.exports = AlgoResult;