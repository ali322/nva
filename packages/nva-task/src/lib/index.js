import { find, compact } from 'lodash'
import merge from 'webpack-merge'
import path from 'path'
import fs from 'fs-extra'
import chalk from 'chalk'
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
            if (v.name) {
                return merge(v, find(webpackConfig, { name: v.name }))
            }
            return merge(v, ...webpackConfig)
        })
    }
    if (config.name) {
        return merge(config, find(webpackConfig, { name: config.name }))
    }
    return merge(config, ...webpackConfig)
}

export function writeToModuleConfig(target, config) {
    try {
        fs.existsSync(target) && fs.writeFileSync(target, JSON.stringify(config, null, 2))
    } catch (e) {
        return false
    }
    return true
}

export function checkManifest(destPath) {
    if (!fs.existsSync(destPath)) {
        console.log(chalk.red('vendor manifest not found,did you forget build vendor?'))
        process.exit(1)
    }
}

export function vendorManifest(stats, destPath) {
    let assetByChunk = {}
    stats.toJson().children.map(function(child) {
        return child.assets
    }).reduce(function(prev, current) {
        return prev.concat(current)
    }, []).forEach(function(v) {
        if (v.chunkNames.length > 0) {
            assetByChunk[v.chunkNames[0]] = path.basename(v.name)
        }
    })
    fs.outputJsonSync(path.join(destPath, 'vendor-manifest.json'), assetByChunk)
}