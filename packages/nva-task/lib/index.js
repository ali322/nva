const { resolve, join, relative } = require('path')
const chalk = require('chalk')
const omit = require('lodash/omit')
const chokidar = require('chokidar')
const { checkFile, checkDir, error, merge } = require('./common/helper')
const initializer = require('./common/initializer')
const { writeModConf } = require('./common')
const prettyError = require('./common/pretty-error')

module.exports = (options = {}) => {
  const { rootPath } = options
  let {
    namespace,
    favicon = '',
    hooks = {},
    proj,
    projConfPath,
    modConfPath = resolve(rootPath, 'bundle.json'),
    mockPath = resolve(rootPath, 'mock'),
    vendorConfPath = resolve(rootPath, 'vendor.json')
  } = options

  modConfPath = proj.modConfPath || modConfPath
  vendorConfPath = proj.vendorConfPath || vendorConfPath
  mockPath = proj.mockPath || mockPath
  const mods = loadConf(modConfPath, e => {
    error('module config is invalid')
    console.log(prettyError(e))
  })
  const vendors = loadConf(vendorConfPath, e => {
    error('vendor config is invalid')
    console.log(prettyError(e))
  })
  const mock = loadMock(mockPath)

  function addMods(more) {
    writeModConf(modConfPath, merge(mods, more))
  }

  function removeMods(keys) {
    writeModConf(modConfPath, omit(mods, keys))
  }

  function startWatcher(strict) {
    let rcs = ['.babelrc']
    if (strict) {
      rcs = rcs.concat(['.eslintrc', '.eslint.*'])
    }
    rcs = rcs.map(rc => resolve(rc))
    watch([projConfPath, modConfPath, vendorConfPath].concat(rcs))
  }

  let context = {
    namespace,
    mods,
    proj: merge({ type: 'frontend', favicon, mock }, proj),
    vendors,
    addMods,
    removeMods,
    startWatcher,
    hooks
  }

  context = exports.init(context)
  return context
}

exports.init = context => {
  const { type } = context.proj
  if (['frontend', 'isomorphic'].indexOf(type) === -1) {
    error('unsupported type')
  }
  return require(`./${type}`)(initializer(context))
}

function watch(files) {
  const watcher = chokidar.watch(files, {
    persistent: true
  })
  watcher.on('change', path => {
    path = relative(process.cwd(), path)
    console.log(chalk.yellow(`file ${path} changed`))
    console.log(chalk.yellow(`server restarting...`))
    watcher.close()
    process.send('RESTART')
  })
}

function loadConf(path, onError) {
  let conf = {}
  if (!checkFile(path)) {
    error(`${path} not exist`)
  }
  try {
    conf = require(path)
  } catch (e) {
    onError(e)
  }
  return conf
}

function loadMock(path) {
  if (!checkDir(path)) {
    error(`${path} not exist`)
  }
  return join(path, '**', '*.@(json|js)')
}
