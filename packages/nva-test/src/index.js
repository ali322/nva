let { join } = require('path')
let karma = require('karma')

const nodeModules = join(__dirname, '..', 'node_modules')

module.exports = function(autowatch) {
    new karma.Server({
        configFile: join(__dirname, 'karma.conf.js'),
        singleRun: !autowatch
    }).start()
}