import { resolve } from 'path'
import { omit } from 'lodash'
import { checkFile, error } from './lib/helper'
import initializer from './lib/initializer'
import { writeModConf } from './lib'

export default function(options = {}) {
    const namespace = options.namespace ? options.namespace : 'nva'
    const rootPath = `.${namespace}`
    const {
        hooks = {},
            projConfPath = resolve(rootPath, `${namespace}.js`),
            modConfPath = resolve(rootPath, 'module.json'),
            vendorConfPath = resolve(rootPath, 'vendor.json')
    } = options

    let proj = loadConf(projConfPath, () => error('project config is invalid'))
    proj.default && (proj = proj.default)
    const mods = loadConf(modConfPath, () => error('module config is invalid'))
    const vendors = loadConf(vendorConfPath, () => error('vendor config is invalid'))

    function addMods(more) {
        writeModConf(modConfPath, { ...mods, ...more })
    }

    function removeMods(keys) {
        writeModConf(modConfPath, omit(mods, keys))
    }

    let context = {
        namespace,
        mods,
        proj: { type: 'frontend', ...proj },
        vendors,
        addMods,
        removeMods,
        ...hooks
    }
    return init(context)
}

function init(context) {
    let { type } = context.proj
    if (['frontend', 'isomorphic'].indexOf(type) === -1) {
        error('unsupported type')
    }
    let tasks = require(`./${type}`)(initializer(context))
    return tasks
}

function loadConf(path, onError) {
    let conf = {}
    if (!checkFile(path)) {
        onError(new Error('config not exist'))
    }
    try {
        conf = require(path)
    } catch (e) {
        onError(e)
    }
    return conf
}