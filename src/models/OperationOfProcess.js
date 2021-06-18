var _ = require('lodash');

function OperationOfProcess(_node) {
  _.extend(this, _node.properties);
}
module.exports = OperationOfProcess;