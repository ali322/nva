import { compact, mapValues, isEqual, isEmpty, isPlainObject } from 'lodash'
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
                entry: 'replace'
            })(v, ...webpackConfig)
        })
    }
    return merge.strategy({
        entry: 'replace'
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
        if (!sourcemap.meta || isEqual(sourcemap.meta, vendors) == false) return false
        let clean = true
        const vendorOutput = dirname(target)
        if (isPlainObject(vendors.js)) {
            Object.keys(vendors.js).forEach(v => {
                if (!existsSync(resolve(vendorOutput, `${v}-manifest.json`))) {
                    clean = false
                    return false
                }
                if (!existsSync(resolve(vendorOutput, sourcemap.js[v]))) {
                    clean = false
                    return false
                }
            })
        }
        if (isPlainObject(vendors.css)) {
            Object.keys(vendors.css).forEach(v => {
                if (!existsSync(resolve(vendorOutput, sourcemap.css[v]))) {
                    clean = false
                    return false
                }
            })
        }
        return clean
    }
    return true
}

export function vendorManifest(stats, meta, target) {
    let assetByChunk = { meta }
    stats.toJson().children.forEach((child) => {
        assetByChunk[child.name] = mapValues(child.assetsByChunkName, v => basename(v))
    })
    outputJsonSync(target, assetByChunk)
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