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

    const proj = loadProj(projConfPath)
    const mods = loadMods(modConfPath)
    const vendors = loadVendors(vendorConfPath)

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

function loadProj(path) {
    let proj = {}
    if (checkFile(path)) {
        proj = require(path)
        proj.default && (proj = proj.default)
    } else {
        error('project config is invalid')
    }
    return proj
}

function loadMods(path) {
    if (!checkFile(path)) {
        error('module config is invalid')
    }
    let mods = require(path)
    return mods
}

function loadVendors(path) {
    let vendors = {}
    if (checkFile(path)) {
        vendors = require(path)
    } else {
        error('vendor config is invalid')
    }
    return vendors
}