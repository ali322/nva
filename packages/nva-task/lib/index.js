const core = require('nva-core')
const { error } = require('nva-util')

module.exports = options => {
  const context = core(options)
  const { type } = context
  if (['frontend', 'isomorphic'].indexOf(type) === -1) {
    error('unsupported type')
  }
  const task = require(`./${type}`)(context)
  task.context = context
  return task
}
