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
    if (isEmpty(vendors) || !isPlainObject(vendors)) return false
    if (vendors.js || vendors.css) {
        if (!existsSync(resolve(target))) return false
        let sourcemap = readJsonSync(resolve(target))
        if (!sourcemap.meta || isEqual(sourcemap.meta, vendors) == false) return false
        let passed = true
        if (vendors.js) {
            Object.keys(vendors.js).forEach(v => {
                if (!existsSync(resolve(dirname(target), `${v}-manifest.json`))) {
                    passed = false
                    return false
                }
                if (!existsSync(sourcemap.js[v])) {
                    passed = false
                    return false
                }
            })
        }
        if (vendors.css) {
            Object.keys(vendors.css).forEach(v => {
                if (!existsSync(sourcemap.css[v])) {
                    passed = false
                    return false
                }
            })
        }
        return passed
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