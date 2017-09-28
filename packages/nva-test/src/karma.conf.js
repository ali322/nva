let { resolve } = require("path")
let argv = require("yargs").argv
let { assign, omit } = require("lodash")
let merge = require("webpack-merge")

let customize = {}
if (argv.c || argv.config) {
  customize = require(resolve(argv.c || argv.config))
}

let sourcePath = resolve("src")
let entry = resolve("test", "unit", "fixture", "setup.js")
let reportPath = resolve("test", "unit", "coverage")

sourcePath = customize.sourcePath || sourcePath
entry = customize.entry || entry
reportPath = customize.reportPath || reportPath

let webpackConfig = require("./webpack.test")({ sourcePath })

let preprocessors = {}
preprocessors[entry] = ["webpack", "sourcemap"]

/* eslint-disable func-names */
module.exports = function (config) {
  let opts = {
    basePath: "",
    frameworks: ["mocha", "sinon-chai"],
    files: [entry],
    exclude: [],
    preprocessors,
    webpack: webpackConfig,
    webpackMiddleware: {
      stats: "errors-only"
    },
    coverageIstanbulReporter: {
      dir: reportPath,
      fixWebpackSourcePaths: true,
      reports: ["html", "lcovonly", "text-summary"]
    },
    reporters: ["spec", "coverage-istanbul"],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ["jsdom"],
    concurrency: Infinity,
    captureTimeout: 60000,
    browserDisconnectTimeout: 10000,
    browserDisconnectTolerance: 1,
    browserNoActivityTimeout: 60000 // by default 10000
  }
  if (customize.webpack) {
    opts.webpack = merge.smart(opts.webpack, customize.webpack)
  }
  let restOpts = omit(customize, ["entry", "reportPath", "webpack"])
  opts = assign({}, opts, restOpts)
  config.set(opts)
}
