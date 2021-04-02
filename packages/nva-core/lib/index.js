const { resolve, join, relative } = require('path')
const colors = require('colors')
const chokidar = require('chokidar')
const dotenv = require('dotenv')
const { readFileSync } = require('fs')
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

const setup = (options = {}) => {
  const namespace = options.namespace ? options.namespace : 'nva'
  const rootPath = `.${namespace}`
  const {
    env,
    watch: customWatch,
    projConfPath = resolve(rootPath, `${namespace}.js`),
    modConfPath = resolve(rootPath, 'bundle.json'),
    mockPath = resolve(rootPath, 'mock'),
    vendorConfPath = resolve(rootPath, 'vendor.json')
  } = options

  let context = bootstrap(options)

  const logText = options.logText
    ? merge(defaultLogText, options.logText)
    : defaultLogText

  let proj = loadConf(projConfPath, logText, (e) => {
    console.log(prettyError(e))
    error(logText.projectInvalid)
  })
  proj.default && (proj = proj.default)

  const mods = loadConf(modConfPath, logText, (e) => {
    console.log(prettyError(e))
    error(logText.moduleInvalid)
  })
  const vendors = loadVendor(vendorConfPath, logText)
  const mock = loadMock(mockPath, logText)
  const { envs, paths: envPath } = loadEnv(rootPath, env)

  function startWatcher(strict) {
    let rcs = ['.babelrc']
    if (strict) {
      rcs = rcs.concat(['.eslintrc', '.eslint.*'])
    }
    rcs = rcs.map((rc) => resolve(rc))
    watch(
      [projConfPath, mockPath, modConfPath, vendorConfPath]
        .concat(rcs)
        .concat(envPath),
      logText,
      customWatch
    )
  }

  context = merge(context, {
    namespace,
    mods,
    proj: merge(context.proj, { mock, env: envs }, proj, options.proj || {}),
    vendors,
    modConfPath,
    startWatcher
  })

  return context
}

const bootstrap = (options = {}) => {
  const logText = options.logText
    ? merge(defaultLogText, options.logText)
    : defaultLogText
  const {
    favicon = '',
    hooks = {},
    onDevProgress,
    onBuildProgress,
    onVendorProgress,
    proj = {},
    mods = {},
    vendors = {}
  } = options
  return {
    proj: merge(
      {
        type: 'frontend',
        favicon,
        mock: false,
        logText,
        env: {}
      },
      proj || {}
    ),
    mods,
    vendors,
    hooks,
    onDevProgress,
    onBuildProgress,
    onVendorProgress
  }
}

function watch(files, logText, onChange) {
  const watcher = chokidar.watch(files, {
    persistent: true
  })
  watcher.on('change', (path) => {
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
  let vendors = loadConf(path, (e) => {
    console.log(prettyError(e))
    error(logText.vendorInvalid)
  })
  if (isPlainObject(vendors)) {
    vendors.js = isPlainObject(vendors.js) ? vendors.js : {}
    vendors.css = isPlainObject(vendors.css) ? vendors.css : {}
  } else {
    vendors = {
      js: {},
      css: {}
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

function loadEnv(path, mode) {
  let envs = {}
  let paths = [join(path, '.env')]
  if (mode) {
    paths.push(join(path, `.${mode}.env`))
  }
  paths.forEach((path) => {
    if (checkFile(path)) {
      let env = readFileSync(path)
      env = dotenv.parse(env)
      envs = merge(envs, env)
    }
  })
  return { envs, paths }
}

const core = (options = {}) => {
  const { explicit = false } = options
  const context = explicit ? bootstrap(options) : setup(options)
  return initializer(context)
}

core.mod = require('./mod')

module.exports = core
