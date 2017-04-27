import { resolve } from 'path'
import { checkFile, error } from './lib/helper'
import interceptor from './lib/interceptor'

export default function(options = {}) {
    const namespace = options.namespace ? options.namespace : 'nva'
    const { moduleConfPath, proj, vendors } = loadConf(options, namespace)
    let context = {
        namespace,
        modules: require(moduleConfPath),
        proj: { type: 'frontend', ...proj },
        vendors
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
    const confDir = `.${namespace}`
    const {
        projConfPath = resolve(confDir, `${namespace}.js`),
            moduleConfPath = resolve(confDir, 'module.json'),
            vendorConfPath = resolve(confDir, 'vendor.json')
    } = options

    let proj = {}
    if (checkFile(projConfPath)) {
        try {
            proj = require(projConfPath)
        } catch (err) {
            error('project config invalid')
        }
        proj.default && (proj = proj.default)
    }

    if (!checkFile(moduleConfPath)) {
        error('module config invalid')
    }

    let vendors = {}
    if (checkFile(vendorConfPath)) {
        try{
            vendors = require(vendorConfPath)
        }catch(err){
            error('vendor config invalid')
        }
    }
    return { moduleConfPath, vendors, proj }
}