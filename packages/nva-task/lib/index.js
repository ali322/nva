const core = require('nva-core')
const { error } = require('nva-util')

module.exports = options => {
  const context = core(options)
  const { type, logText } = context
  if (['frontend', 'isomorphic'].indexOf(type) === -1) {
    error(logText.wrongType)
  }
  const task = require(`./${type}`)(context)
  task.addMod = (name, answers, template) => core.mod.addMod(name, answers, template, context)
  task.removeMod = (names) => core.mod.removeMod(names, context)
  task.context = context
  return task
}
