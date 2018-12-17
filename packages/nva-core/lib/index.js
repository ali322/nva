const { resolve, join, relative } = require('path')
const chalk = require('chalk')
const chokidar = require('chokidar')
const isPlainObject = require('lodash/isPlainObject')
const {
  checkFile,
  checkDir,
  error,
  merge,
  prettyError
} = require('nva-util')
const initializer = require('./init')

const core = (options = {}) => {
  const namespace = options.namespace ? options.namespace : 'nva'
  const rootPath = `.${namespace}`
  const {
    favicon = '',
    hooks = {},
    onDevProgress,
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
  const vendors = loadVendor(vendorConfPath, e => {
    error('vendor config is invalid')
    console.log(prettyError(e))
  })
  const mock = loadMock(mockPath)

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
    modConfPath,
    startWatcher,
    hooks,
    onDevProgress
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

function loadVendor(path, onError) {
  let vendors = loadConf(path, e => {
    error('vendor config is invalid')
    console.log(prettyError(e))
  })
  if (isPlainObject(vendors)) {
    vendors.js = isPlainObject(vendors.js) ? vendors.js : {}
    vendors.css = isPlainObject(vendors.css) ? vendors.css : {}
  } else {
    vendors = {
      js: {}, css: {}
    }
  }
  return vendors
}

function loadMock(path) {
  if (!checkDir(path)) {
    error(`${path} not exist`)
  }
  return join(path, '**', '*.@(json|js)')
}

core.mod = require('./mod')
module.exports = core