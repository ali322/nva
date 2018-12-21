const { resolve, join, relative } = require('path')
const colors = require('colors')
const chokidar = require('chokidar')
const isPlainObject = require('lodash/isPlainObject')
const {
  checkFile,
  checkDir,
  error,
  merge,
  prettyError,
  sprintf
} = require('nva-util')
const initializer = require('./init')
const defaultLogText = require('./log-text')

const core = (options = {}) => {
  const namespace = options.namespace ? options.namespace : 'nva'
  const rootPath = `.${namespace}`
  const {
    favicon = '',
    hooks = {},
    onDevProgress,
    watch: customWatch,
    projConfPath = resolve(rootPath, `${namespace}.js`),
    modConfPath = resolve(rootPath, 'bundle.json'),
    mockPath = resolve(rootPath, 'mock'),
    vendorConfPath = resolve(rootPath, 'vendor.json')
  } = options

  const logText = options.logText ? merge(defaultLogText, options.logText) : defaultLogText

  let proj = loadConf(projConfPath, logText, e => {
    error(logText.projectInvalid)
    console.log(prettyError(e))
  })
  proj.default && (proj = proj.default)

  const mods = loadConf(modConfPath, logText, e => {
    error(logText.moduleInvalid)
    console.log(prettyError(e))
  })
  const vendors = loadVendor(vendorConfPath, logText)
  const mock = loadMock(mockPath, logText)

  function startWatcher(strict) {
    let rcs = ['.babelrc']
    if (strict) {
      rcs = rcs.concat(['.eslintrc', '.eslint.*'])
    }
    rcs = rcs.map(rc => resolve(rc))
    watch([projConfPath, modConfPath, vendorConfPath].concat(rcs), logText, customWatch)
  }

  let context = {
    namespace,
    mods,
    proj: merge({ type: 'frontend', favicon, mock, logText }, proj, options.proj || {}),
    vendors,
    modConfPath,
    startWatcher,
    hooks,
    onDevProgress
  }

  context = initializer(context)
  return context
}

function watch(files, logText, onChange) {
  const watcher = chokidar.watch(files, {
    persistent: true
  })
  watcher.on('change', path => {
    path = relative(process.cwd(), path)
    console.log(colors.yellow(sprintf(logText.fileChanged, [path])))
    if (typeof onChange === 'function') {
      onChange(path)
      watcher.close()
    } else {
      console.log(colors.yellow(logText.serverRestart))
      watcher.close()
      process.send('RESTART')
    }
  })
}

function loadConf(path, logText, onError) {
  let conf = {}
  if (!checkFile(path)) {
    error(sprintf(logText.pathInvalid, [path]))
  }
  try {
    conf = require(path)
  } catch (e) {
    onError(e)
  }
  return conf
}

function loadVendor(path, logText) {
  let vendors = loadConf(path, e => {
    error(logText.vendorInvalid)
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

function loadMock(path, logText) {
  if (!checkDir(path)) {
    error(sprintf(logText.pathInvalid, [path]))
  }
  return join(path, '**', '*.@(json|js)')
}

core.mod = require('./mod')
module.exports = core