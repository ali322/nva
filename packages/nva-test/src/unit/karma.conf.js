let { resolve, join } = require('path')
let fs = require('fs')
let merge = require('webpack-merge')
let webpackConfig = require(join(__dirname, 'webpack.test'))

let customWebpackConfig = resolve('test','unit','fixture','webpack.test.js')
if(fs.existsSync(customWebpackConfig)){
    webpackConfig = merge(webpackConfig,require(customWebpackConfig))
}

let entry = resolve('test', 'unit', 'fixture', 'setup.js')
let reportFolder = resolve('test', 'unit', 'coverage')

let preprocessors = {}
preprocessors[entry] = ['webpack', 'sourcemap']

/* eslint-disable func-names */
module.exports = function(config) {
    config.set({
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
        singleRun: false,
        concurrency: Infinity,
        captureTimeout: 60000,
        browserDisconnectTimeout: 10000,
        browserDisconnectTolerance: 1,
        browserNoActivityTimeout: 60000 //by default 10000
    })
}