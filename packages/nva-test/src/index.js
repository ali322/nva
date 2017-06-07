let spawn = require('cross-spawn')
let exec = require('execa')
let nightwatch = require('nightwatch')
let { resolve, join } = require('path')
let fs = require('fs')
let karma = require('karma')

const nodeModules = join(__dirname, '..', 'node_modules')

exports.e2e = function(runner, conf, browser = 'chrome') {
    process.env.NODE_ENV = 'testing'
    let server
    try {
        server = require(resolve(runner))
    } catch (err) {
        throw err
    }
    let opts = []

    if (conf && fs.existsSync(resolve(conf))) {
        opts = opts.concat(['--customize', resolve(conf)])
    }

    opts = opts.concat(['--config', join(__dirname, 'e2e', 'nightwatch.conf.js')])
    if (['chrome'].indexOf(browser) === -1) {
        throw new Error('unsupported browser')
    }
    opts = opts.concat(['--env', browser])

    let instance = exec.sync(join(nodeModules, '.bin', 'nightwatch'), opts, { stdio: 'inherit' })
    instance.on('exit', (code) => {
        server.close()
        process.exit(code)
    })

    instance.on('error', (err) => {
        server.close()
        throw err
    })
}

exports.unit = function(autowatch) {
    new karma.Server({
        configFile: join(__dirname, 'unit', 'karma.conf.js'),
        singleRun: !autowatch
    }).start()
}