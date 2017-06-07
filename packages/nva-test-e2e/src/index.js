let exec = require('execa')
let nightwatch = require('nightwatch')
let { existsSync } = require('fs')
let { resolve, join } = require('path')

module.exports = function(runner, conf, browser = 'chrome') {
    process.env.NODE_ENV = 'testing'
    let server
    try {
        server = require(resolve(runner))
    } catch (err) {
        throw err
    }
    let opts = []

    if (conf && existsSync(resolve(conf))) {
        opts = opts.concat(['--customize', resolve(conf)])
    }

    opts = opts.concat(['--config', join(__dirname, 'nightwatch.conf.js')])
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