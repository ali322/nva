import { compact } from 'lodash'
import merge from 'webpack-merge'
import { join, basename, resolve } from 'path'
import fs from 'fs-extra'
import chalk from 'chalk'
import opn from 'opn'
import { getLanIP } from './helper'

export const DEBUG = process.env.NODE_ENV !== 'production'

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
    if (!fs.existsSync(resolve(target, 'vendor-manifest.json'))) return false
    let passed = true
    if (vendor.js) {
        Object.keys(vendor.js).forEach(v => {
            if (!fs.existsSync(resolve(target, `${v}-manifest.json`))) {
                passed = false
                return
            }
        })
    }
    return passed
}

export function vendorManifest(stats, destPath) {
    let assetByChunk = {}
    stats.toJson().children.map(function(child) {
        return child.assets
    }).reduce(function(prev, current) {
        return prev.concat(current)
    }, []).forEach(function(v) {
        if (v.chunkNames.length > 0) {
            assetByChunk[v.chunkNames[0]] = basename(v.name)
        }
    })
    fs.outputJsonSync(join(destPath, 'vendor-manifest.json'), assetByChunk)
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