let compact = require('lodash/compact')
let mapValues = require('lodash/mapValues')
let isEqual = require('lodash/isEqual')
let isPlainObject = require('lodash/isPlainObject')
let forEach = require('lodash/forEach')
let startsWith = require('lodash/startsWith')
let every = require('lodash/every')
let merge = require('webpack-merge')
let { dirname, basename, resolve } = require('path')
let { existsSync, outputFileSync, outputJsonSync, readJsonSync } = require('fs-extra')
let chalk = require('chalk')
let opn = require('opn')
let { lanIP } = require('./helper')

exports.serverHost = port => {
  const ip = lanIP()
  return `http://${ip}:${port}`
}

exports.mergeConfig = (config, value) => {
  const webpackConfig = Array.isArray(value) ? compact(value) : [value]
  if (Array.isArray(config)) {
    return config.map(v => {
      return merge.strategy({
        plugins: 'replace',
        entry: 'replace',
        'module.rules': 'replace'
      })(v, ...webpackConfig)
    })
  }
  return merge.strategy({
    plugins: 'replace',
    entry: 'replace',
    'module.rules': 'replace'
  })(config, ...webpackConfig)
}

exports.writeModConf = (target, config) => {
  try {
    outputFileSync(target, JSON.stringify(config, null, 2))
  } catch (e) {
    return false
  }
  return true
}

exports.checkVendor = (vendors, target) => {
  if (
    (vendors.js && isPlainObject(vendors.js)) ||
    (vendors.css && isPlainObject(vendors.css))
  ) {
    if (!existsSync(resolve(target))) return false
    let sourcemap = readJsonSync(resolve(target))
    /* check meta */
    if (!sourcemap.meta || isEqual(sourcemap.meta, vendors) === false) {
      return false
    }

    /* check version */
    let version = sourcemap.version
    let localModChecked = every(version, (ver, mod) =>
      isEqual(ver, modVersion(mod))
    )

    /* check output */
    let output = sourcemap.output || {}
    let jsChecked = true
    let cssChecked = true
    const vendorOutput = dirname(target)
    if (isPlainObject(vendors.js) && isPlainObject(output.js)) {
      jsChecked = every(
        Object.keys(vendors.js),
        v =>
          existsSync(resolve(vendorOutput, `${v}-manifest.json`)) &&
          existsSync(resolve(vendorOutput, output.js[v]))
      )
    }
    if (isPlainObject(vendors.css) && isPlainObject(output.css)) {
      cssChecked = every(Object.keys(vendors.js), v =>{
        return existsSync(resolve(vendorOutput, output.css[v]))
      })
    }
    return jsChecked && cssChecked && localModChecked
  }
  return true
}

exports.vendorManifest = (stats, meta, target) => {
  let output = {}
  stats.toJson().children.forEach(child => {
    output[child.name] = mapValues(child.assetsByChunkName, v => basename(v))
  })
  outputJsonSync(target, { output, meta, version: vendorVersion(meta) })
}

function vendorVersion(meta) {
  let version = {}
  let metas = []
  const mapper = mod =>
    startsWith(mod, '@')
      ? mod
        .split('/')
        .slice(0, 1)
        .join('/')
      : mod.split('/')[0]
  if (meta.js) {
    forEach(meta.js, v => {
      metas = metas.concat(v)
    })
  }
  if (meta.css) {
    forEach(meta.css, v => {
      metas = metas.concat(v)
    })
  }
  metas.map(mapper).forEach(mod => {
    version[mod] = modVersion(mod)
  })
  return version
}

function modVersion(mod) {
  const pkg = readJsonSync(resolve('node_modules', mod, 'package.json'))
  return pkg && pkg.version
}

exports.openBrowser = (target, url) => {
  let opts = { wait: false }
  if (target !== 'none') {
    if (target !== 'default') {
      opts.app = target.split(',')
    }
    let opener = opn(url, opts)
    opener.catch(err => console.log(chalk.red('canot open in browser'), err))
  }
}
