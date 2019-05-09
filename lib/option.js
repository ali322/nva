const hooks = require('./hook')

module.exports = more => Object.assign({}, {
  hooks
}, more || {})