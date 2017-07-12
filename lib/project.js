let fs = require('fs')
let chalk = require('chalk')
let hooks = require('./hook')
let path = require('path')


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
    const projConfPath = options.projConfPath ? options.projConfPath : path.resolve(rootPath, `${namespace}.js`)

    let proj = loadConf(projConfPath, () => {
        console.log(chalk.red('project config is invalid'))
        process.exit(1)
    })
    proj.default && (proj = proj.default)

    return {
        namespace,
        rootPath,
        projConfPath,
        proj
    }
}