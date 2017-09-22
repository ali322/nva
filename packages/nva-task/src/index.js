import { resolve, join, relative } from 'path'
import chalk from 'chalk'
import { omit } from 'lodash'
import { watch as watching } from 'chokidar'
import { checkFile, checkDir, error } from './lib/helper'
import initializer from './lib/initializer'
import { writeModConf } from './lib'

export default function(options = {}) {
    const { rootPath } = options
    let {
        namespace,
        favicon = '',
        hooks = {},
        proj,
        projConfPath,
        modConfPath = resolve(rootPath, 'bundle.json'),
        mockPath = resolve(rootPath, 'mock'),
        vendorConfPath = resolve(rootPath, 'vendor.json')
    } = options

    modConfPath = proj.modConfPath || modConfPath
    vendorConfPath = proj.vendorConfPath || vendorConfPath
    mockPath = proj.mockPath || mockPath
    const mods = loadConf(modConfPath, () => error('module config is invalid'))
    const vendors = loadConf(vendorConfPath, () => error('vendor config is invalid'))
    const mock = loadMock(mockPath, () => error('mock config is invalid'))

    function addMods(more) {
        writeModConf(modConfPath, { ...mods, ...more })
    }

    function removeMods(keys) {
        writeModConf(modConfPath, omit(mods, keys))
    }

    function startWatcher() {
        watch([projConfPath, modConfPath, vendorConfPath])
    }

    let context = {
        namespace,
        mods,
        proj: { type: 'frontend', favicon, mock, ...proj },
        vendors,
        addMods,
        removeMods,
        startWatcher,
        hooks
    }

    return init(context)
}

function init(context) {
    let { type } = context.proj
    if (['frontend', 'isomorphic'].indexOf(type) === -1) {
        error('unsupported type')
    }
    context = initializer(context)
    let tasks = require(`./${type}`)(context)
    return tasks
}

function watch(files) {
    const watcher = watching(files, {
        persistent: true
    })
    watcher.on('change', path => {
        path = relative(process.cwd(), path)
        console.log(chalk.yellow(`file ${path} changed`))
        console.log(chalk.yellow(`develop server restarting...`))
        watcher.close()
        process.send('RESTART')
    })

}

function loadConf(path, onError) {
    let conf = {}
    if (!checkFile(path)) {
        error(`${path} not exist`)
    }
    try {
        conf = require(path)
    } catch (e) {
        onError(e)
    }
    return conf
}

function loadMock(path) {
    if (!checkDir(path)) {
        error(`${path} not exist`)
    }
    return join(path, '**', '*.@(json|js)')
}