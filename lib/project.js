let fs = require('fs')
let chalk = require('chalk')
let hooks = require('./hook')


function loadConf(path, onError) {
    let conf = {}
    if (!fs.existsSync(path)) {
        error(`${path} not exist`)
    }
    try {
        conf = require(path)
    } catch (e) {
        onError(e)
    }
    return conf
}

module.exports = function(options = {}) {
    const namespace = options.namespace ? options.namespace : 'nva'
    const rootPath = `.${namespace}`

    let proj = loadConf(projConfPath, () => {
        console.log(chalk.red('project config is invalid'))
        process.exit(1)
    })
    proj.default && (proj = proj.default)

    return {
        namespace,
        rootPath,
        proj
    }
}