const { resolve, join, relative } = require('path')
const chalk = require('chalk')
const omit = require('lodash/omit')
const chokidar = require('chokidar')
const {
  checkFile,
  checkDir,
  error,
  merge,
  writeModConf,
  prettyError
} = require('nva-util')
const initializer = require('./init')

module.exports = (options = {}) => {
  const namespace = options.namespace ? options.namespace : 'nva'
  const rootPath = `.${namespace}`
  const {
    favicon = '',
    hooks = {},
    projConfPath = resolve(rootPath, `${namespace}.js`),
    modConfPath = resolve(rootPath, 'bundle.json'),
    mockPath = resolve(rootPath, 'mock'),
    vendorConfPath = resolve(rootPath, 'vendor.json')
  } = options

  let proj = loadConf(projConfPath, e => {
    error('project config is invalid')
    console.log(prettyError(e))
  })
  proj.default && (proj = proj.default)

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

  context = initializer(context)
  return context
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
