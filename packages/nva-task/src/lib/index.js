import { compact, mapValues, isEqual, isPlainObject, forEach, startsWith, every } from 'lodash'
import merge from 'webpack-merge'
import { dirname, basename, resolve } from 'path'
import { existsSync, outputFileSync, outputJsonSync, readJsonSync } from 'fs-extra'
import chalk from 'chalk'
import opn from 'opn'
import { lanIP } from './helper'

export function serverHost(port) {
    const ip = lanIP()
    return `http://${ip}:${port}`
}

export function mergeConfig(config, value) {
    const webpackConfig = Array.isArray(value) ? compact(value) : [value]
    if (Array.isArray(config)) {
        return config.map(v => {
            return merge.strategy({
                plugins: 'replace',
                entry: 'replace',
                "module.rules": "replace"
            })(v, ...webpackConfig)
        })
    }
    return merge.strategy({
        plugins: 'replace',
        entry: 'replace',
        "module.rules": "replace"
    })(config, ...webpackConfig)
}

export function writeModConf(target, config) {
    try {
        outputFileSync(target, JSON.stringify(config, null, 2))
    } catch (e) {
        return false
    }
    return true
}

export function checkVendor(vendors, target) {
    if ((vendors.js && isPlainObject(vendors.js)) || (vendors.css && isPlainObject(vendors.css))) {
        if (!existsSync(resolve(target))) return false
        let sourcemap = readJsonSync(resolve(target))
        /* check meta */
        if (!sourcemap.meta || isEqual(sourcemap.meta, vendors) == false) return false

        /* check version */
        let version = sourcemap.version
        let localModChecked = every(version, (ver, mod) => isEqual(ver, modVersion(mod)))

        /* check output */
        let output = sourcemap.output || {}
        let jsChecked = true,
            cssChecked = true
        const vendorOutput = dirname(target)
        if (isPlainObject(vendors.js) && isPlainObject(output.js)) {
            jsChecked = every(Object.keys(vendors.js), v => existsSync(resolve(vendorOutput, `${v}-manifest.json`)) &&
                existsSync(resolve(vendorOutput, output.js[v])))
        }
        if (isPlainObject(vendors.css) && isPlainObject(output.css)) {
            cssChecked = every(Object.keys(vendors.js), v => existsSync(resolve(vendorOutput, output.css[v])))
        }
        return jsChecked && cssChecked && localModChecked
    }
    return true
}

export function vendorManifest(stats, meta, target) {
    let output = {}
    stats.toJson().children.forEach((child) => {
        output[child.name] = mapValues(child.assetsByChunkName, v => basename(v))
    })
    outputJsonSync(target, { output, meta, version: vendorVersion(meta) })
}

function vendorVersion(meta) {
    let version = {},
        metas = []
    const mapper = mod => startsWith(mod, '@') ? mod.split('/').slice(0, 1).join('/') : mod.split('/')[0]
    if (meta.js) {
        forEach(meta.js, v => {
            metas = metas.concat(v)
        })
    }
    if (meta.css) {
        forEach(meta.css, v => {
            metas = metas.concat(v)
        })
    }
    metas.map(mapper).forEach(mod => {
        version[mod] = modVersion(mod)
    })
    return version
}

function modVersion(mod) {
    return require(resolve('node_modules', mod, 'package.json')).version
}

export function openBrowser(target, url) {
    let opts = { wait: false }
    if (target !== 'none') {
        if (target !== 'default') {
            opts.app = target.split(',')
        }
        let opener = opn(url, opts)
        opener.catch(err => console.log(chalk.red('canot open in browser'), err))
    }
}