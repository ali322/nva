const fs = require('fs')
const chalk = require('chalk')
const hooks = require('./hook')
const path = require('path')
const prettyError = require('./pretty-error')

function loadConf (path, onError) {
  let conf = {}
  if (!fs.existsSync(path)) {
    console.log(chalk.red(`${path} not exist`))
    process.exit(1)
  }
  try {
    conf = require(path)
  } catch (e) {
    onError(e)
  }
  return conf
}

module.exports = function (options = {}) {
  const namespace = options.namespace ? options.namespace : 'nva'
  const rootPath = `.${namespace}`
  const projConfPath = options.projConfPath
    ? options.projConfPath
    : path.resolve(rootPath, `${namespace}.js`)

  let proj = loadConf(projConfPath, (e) => {
    console.log(chalk.red('project config is invalid'))
    console.log(prettyError(e))
    process.exit(1)
  })
  proj.default && (proj = proj.default)

  return {
    autocheck: proj.autocheck || [],
    namespace,
    hooks,
    rootPath,
    projConfPath,
    proj
  }
}
