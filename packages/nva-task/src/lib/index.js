import { compact, mapValues } from 'lodash'
import merge from 'webpack-merge'
import { dirname, basename, resolve } from 'path'
import fs from 'fs-extra'
import chalk from 'chalk'
import opn from 'opn'
import { getLanIP } from './helper'

export function serverHost(port) {
    const lanIP = getLanIP()
    return `http://${lanIP}:${port}`
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

export function writeToModuleConfig(target, config) {
    try {
        fs.outputFileSync(target, JSON.stringify(config, null, 2))
    } catch (e) {
        return false
    }
    return true
}

export function checkVendor(vendor, target) {
    if (!vendor) return false
    if (!fs.existsSync(resolve(target))) return false
    let passed = true
    if (vendor.js) {
        Object.keys(vendor.js).forEach(v => {
            if (!fs.existsSync(resolve(dirname(target), `${v}-manifest.json`))) {
                passed = false
                return
            }
        })
    }
    return passed
}

export function vendorManifest(stats, target) {
    let assetByChunk = {}
    stats.toJson().children.forEach((child) => {
        assetByChunk[child.name] = mapValues(child.assetsByChunkName, v => basename(v))
    })
    fs.outputJsonSync(target, assetByChunk)
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