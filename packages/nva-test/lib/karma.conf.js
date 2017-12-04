let { resolve } = require("path")
let argv = require("yargs").argv
let { assign, omit } = require("lodash")
let merge = require("webpack-merge")
let chalk = require("chalk")

let conf = argv.c || argv.config
if (conf) {
  try {
    conf = require(resolve(conf))
  } catch (e) {
    console.log(chalk.red("config invalid"))
    process.exit(1)
  }
}

function mergeOpts (defaults, opts) {
  let sourcePath = resolve("src")
  let entry = resolve("test", "unit", "fixture", "setup.js")
  let reportPath = resolve("test", "unit", "coverage")

  let preprocessors = {}
  preprocessors[entry] = ["webpack", "sourcemap"]

  let options = assign({}, defaults, {
    files: [opts.entry ? opts.entry : entry],
    preprocessors,
    browsers: opts.browsers ? opts.browsers : ["jsdom"],
    coverageIstanbulReporter: {
      dir: reportPath,
      fixWebpackSourcePaths: true,
      reports: ["html", "lcovonly", "text-summary"]
    }
  })

  options.webpack = require("./webpack.test")({ sourcePath })
  if (opts.webpack) {
    options.webpack = merge.strategy({
      plugins: "replace",
      entry: "replace",
      "module.rules": "replace"
    })(options.webpack, opts.webpack)
  }

  let restOpts = omit(opts, ["entry", "reportPath", "webpack"])
  return assign({}, options, restOpts)
}

/* eslint-disable func-names */
module.exports = function (config) {
  let defaults = {
    basePath: "",
    frameworks: ["mocha", "sinon-chai"],
    exclude: [],
    webpackMiddleware: {
      stats: "errors-only"
    },
    reporters: ["spec", "coverage-istanbul"],
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
