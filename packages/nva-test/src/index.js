let spawn = require('cross-spawn')
let { resolve, join } = require('path')
let karma = require('karma')

exports.e2e = function(runner, conf, browser = 'chrome') {
    process.env.NODE_ENV = 'testing'
    let server
    try {
        server = require(resolve(runner))
    } catch (err) {
        throw new Error('runner conf invalid')
    }
    let opts = []

    if (conf) {
        opts = opts.concat(['--config', resolve(conf)])
    } else {
        opts = opts.concat(['--config', join(__dirname, 'e2e', 'nightwatch.conf.js')])
    }
    if (['chrome'].indexOf(browser) === -1) {
        throw new Error('unsupported browser')
    }
    opts = opts.concat(['--env', browser])

    let instance = spawn(join(__dirname, '..', 'node_modules', '.bin', 'nightwatch'), opts, { stdio: 'inherit' })
    instance.on('exit', (code) => {
        server.close()
        process.exit(code)
    })

    instance.on('error', (err) => {
        server.close()
        throw err
    })
}

exports.unit = function(conf) {
    new karma.Server({
        configFile: conf ? resolve(conf) : join(__dirname, 'unit', 'karma.conf.js'),
        singleRun: true
    }).start()
}