let { resolve, join } = require('path')
let fs = require('fs')
let argv = require('yargs').argv
let { assign, omit } = require('lodash')
let merge = require('webpack-merge')
let webpackConfig = require(join(__dirname, 'webpack.test'))

let entry = resolve('test', 'unit', 'fixture', 'setup.js')
let reportFolder = resolve('test', 'unit', 'coverage')

let customize = {}
if (argv.c || argv.config) {
    customize = require(resolve(argv.c || argv.config))
}

entry = customize.entry || entry
reportFolder = customize.reportFolder || reportFolder

let preprocessors = {}
preprocessors[entry] = ['webpack', 'sourcemap']

/* eslint-disable func-names */
module.exports = function(config) {
    let opts = {
        basePath: '',
        frameworks: ['mocha', 'sinon-chai'],
        files: [
            entry
        ],
        exclude: [],
        preprocessors,
        webpack: webpackConfig,
        webpackMiddleware: {
            stats: 'errors-only'
        },
        coverageReporter: {
            dir: reportFolder,
            reporters: [
                { type: 'lcov', subdir: '.' },
                { type: 'text-summary' }
            ]
        },
        reporters: ['spec', 'coverage'],
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: true,
        browsers: ['PhantomJS'],
        concurrency: Infinity,
        captureTimeout: 60000,
        browserDisconnectTimeout: 10000,
        browserDisconnectTolerance: 1,
        browserNoActivityTimeout: 60000 //by default 10000
    }
    if (customize.webpack) {
        opts.webpack = merge.smart(opts.webpack, customize.webpack)
    }
    let restOpts = omit(customize, ['entry', 'reportFolder', 'webpack'])
    opts = assign({}, opts, restOpts)
    config.set(opts)
}