import { resolve } from 'path'
import { checkFile, error } from './lib/helper'
import interceptor from './lib/interceptor'

export default function(options = {}) {
    const namespace = options.namespace ? options.namespace : 'nva'
    const hooks = options.hooks ? options.hooks : {}
    const { modules, proj, vendors } = loadConf(options, namespace)
    let context = {
        namespace,
        modules,
        proj: { type: 'frontend', ...proj },
        vendors,
        ...hooks
    }
    return init(context)
}

function init(context) {
    let { type } = context.proj
    if (['frontend', 'isomorphic'].indexOf(type) === -1) {
        error('unsupported type')
    }
    let tasks = require(`./${type}`)(interceptor(context))
    return tasks
}

function loadConf(options, namespace) {
    const confFolder = `.${namespace}`
    const {
        projConfPath = resolve(confFolder, `${namespace}.js`),
            moduleConfPath = resolve(confFolder, 'module.json'),
            vendorConfPath = resolve(confFolder, 'vendor.json')
    } = options

    let proj = {}
    if (checkFile(projConfPath)) {
        proj = require(projConfPath)
        proj.default && (proj = proj.default)
    } else {
        error('project config is invalid')
    }

    if (!checkFile(moduleConfPath)) {
        error('module config is invalid')
    }
    let modules = require(moduleConfPath)
    proj.confFolder = confFolder
    proj.moduleConfPath = moduleConfPath
    proj.moduleConf = modules

    let vendors = {}
    if (checkFile(vendorConfPath)) {
        vendors = require(vendorConfPath)
    } else {
        error('vendor config is invalid')
    }
    return { modules, vendors, proj }
}