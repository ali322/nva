const compact = require('lodash/compact')
const mapValues = require('lodash/mapValues')
const isEqual = require('lodash/isEqual')
const isPlainObject = require('lodash/isPlainObject')
const forEach = require('lodash/forEach')
const startsWith = require('lodash/startsWith')
const every = require('lodash/every')
const merge = require('webpack-merge')
const { dirname, basename, resolve } = require('path')
const execSync = require('child_process').execSync
const { existsSync, outputJsonSync, readJsonSync } = require('fs-extra')
const chalk = require('chalk')
const opn = require('opn')

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

exports.checkVendor = (vendors, target) => {
  if (!existsSync(resolve(target))) return false
  const sourcemap = readJsonSync(resolve(target))
  /* check sourcemap meta with vendor config */
  if (!sourcemap.meta || isEqual(sourcemap.meta, vendors) === false) {
    return false
  }

  /* check sourcemap version with local package version */
  const version = sourcemap.version
  const localModChecked = every(version, (ver, mod) =>
    isEqual(ver, modVersion(mod))
  )

  /* check output files as expected */
  const output = sourcemap.output || {}
  let jsChecked = true
  let cssChecked = true
  const vendorOutput = dirname(target)
  if (isPlainObject(output.js)) {
    jsChecked = every(
      Object.keys(vendors.js),
      v =>
        existsSync(resolve(vendorOutput, `${v}-manifest.json`)) &&
        existsSync(resolve(vendorOutput, output.js[v]))
    )
  }
  if (isPlainObject(output.css)) {
    cssChecked = every(Object.keys(vendors.css), v => {
      return existsSync(resolve(vendorOutput, output.css[v]))
    })
  }
  return jsChecked && cssChecked && localModChecked
}

exports.sourceMapByVendor = (stats, meta, target) => {
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
    if (process.platform === 'darwin' && target === 'google chrome') {
      try {
        execSync('ps cax | grep "Google Chrome"')
        execSync(`osascript open-chrome.applescript "${encodeURI(url)}"`, {
          cwd: __dirname,
          stdio: 'ignore'
        })
      } catch (err) {
        console.log(chalk.red('canot open in browser'), err)
      }
    } else {
      let opener = opn(url, opts)
      opener.catch(err => console.log(chalk.red('canot open in browser'), err))
    }
  }
}
