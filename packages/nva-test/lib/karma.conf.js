const { resolve } = require('path')
const { existsSync } = require('fs')
const argv = require('yargs').argv
const { assign, omit } = require('lodash')
const merge = require('webpack-merge')
const chalk = require('chalk')

const autowatch = argv.w || argv.watch
const confPath = argv.c || argv.config
let conf = {
  entry: resolve('test', 'unit', 'fixture', 'setup.js'),
  reportPath: resolve('test', 'unit', 'coverage'),
  browsers: ['jsdom'],
  webpack: null
}
if (confPath || existsSync(confPath)) {
  let config
  try {
    config = require(resolve(confPath))
    conf = assign({}, conf, config)
  } catch (e) {
    console.log(chalk.red('config invalid'))
    process.exit(1)
  }
}

function mergeOpts(defaults, opts) {
  const { entry, reportPath, browsers, webpack } = opts
  let preprocessors = {}
  preprocessors[entry] = ['webpack', 'sourcemap']

  let options = assign({}, defaults, {
    files: [entry],
    preprocessors,
    browsers,
    coverageIstanbulReporter: {
      dir: reportPath,
      fixWebpackSourcePaths: true,
      reports: ['html', 'lcovonly', 'text-summary']
    }
  })

  options.webpack = require('./webpack.test')({ autowatch })
  if (webpack) {
    options.webpack = merge.strategy({
      plugins: 'replace',
      entry: 'replace',
      'module.rules': 'replace'
    })(options.webpack, webpack)
  }

  let restOpts = omit(opts, ['entry', 'reportPath', 'webpack', 'browsers'])
  return assign({}, options, restOpts)
}

/* eslint-disable func-names */
module.exports = function(config) {
  const defaults = {
    basePath: '',
    frameworks: ['mocha', 'sinon-chai'],
    exclude: [],
    webpackMiddleware: {
      stats: 'errors-only'
    },
    reporters: ['spec', 'coverage-istanbul'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    concurrency: Infinity,
    captureTimeout: 60000,
    browserDisconnectTimeout: 10000,
    browserDisconnectTolerance: 1,
    browserNoActivityTimeout: 60000 // by default 10000
  }
  config.set(mergeOpts(defaults, conf))
}
