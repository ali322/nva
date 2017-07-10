import webpack from 'webpack'
import del from 'del'
import { forEach, isString } from 'lodash'
import { join, resolve, sep } from 'path'
import { addMod, removeMod } from '../lib/mod'
import { vendorManifest, mergeConfig, checkVendor } from '../lib'
import checkVersion from '../lib/check-version'
import { callback } from '../lib/helper'
import vendorFactory from '../lib/vendor'
import releaseConfigFactory from './webpack.production'
import developServer from './develop-server'

module.exports = context => {
    let {
        distFolder,
        chunkFolder,
        vendorFolder,
        assetFolder,
        imageFolder,
        fontFolder,
        imagePrefix,
        fontPrefix,
        beforeBuild,
        afterBuild,
        beforeVendor,
        afterVendor,
        hooks,
        mods,
        vendors,
        vendorSourceMap,
        cachePath
    } = context

    const constants = {
        CSS_OUTPUT: join("[name]", "[name]-[hash:8].css"),
        OUTPUT_PATH: resolve(distFolder),
        IMAGE_OUTPUT: join(assetFolder, imageFolder, sep),
        FONT_OUTPUT: join(assetFolder, fontFolder, sep),
        IMAGE_PREFIX: imagePrefix || join('..', assetFolder, imageFolder),
        FONT_PREFIX: fontPrefix || join('..', assetFolder, fontFolder),
        VENDOR_OUTPUT: join(distFolder, vendorFolder),
        MANIFEST_PATH: join(distFolder, vendorFolder),
        CACHE_PATH: cachePath
    }

    const tasks = {
        addMod(names, answers, template) {
            addMod(names, answers, template, context)
        },
        removeMod(names) {
            removeMod(names, context)
        },
        build({ profile }) {
            if (checkVendor(vendors, join(constants.VENDOR_OUTPUT, vendorSourceMap)) === false) {
                tasks.vendor(tasks.build.bind(null, { profile }))
                return
            }
            let releaseConfig = releaseConfigFactory(context, constants, profile)
            if (typeof hooks.beforeBuild === 'function') {
                releaseConfig = mergeConfig(releaseConfig, hooks.beforeBuild(releaseConfig))
            }
            if (typeof beforeBuild === 'function') {
                releaseConfig = mergeConfig(releaseConfig, beforeBuild(releaseConfig))
            }
            /** clean build assets*/
            forEach(mods, (mod, name) => {
                Object.keys(mod.output).forEach(v => {
                    if (isString(mod.output[v])) {
                        del.sync(mod.output[v])
                    }
                })
                del.sync(join(distFolder, name))
            })
            del.sync(join(distFolder, chunkFolder))

            let compiler = webpack(releaseConfig)
            compiler.run(function(err, stats) {
                if (typeof hooks.afterBuild === 'function') {
                    hooks.afterBuild(err, stats)
                }
                if (typeof afterBuild === 'function') {
                    afterBuild(err, stats)
                }
                callback('build success!', err, stats)
            })
        },
        vendor(next) {
            let vendorConfig = vendorFactory(context, constants)
            if (typeof hooks.beforeVendor === 'function') {
                vendorConfig = mergeConfig(vendorConfig, hooks.beforeVendor(vendorConfig))
            }
            if (typeof beforeVendor === 'function') {
                vendorConfig = mergeConfig(vendorConfig, beforeVendor(vendorConfig))
            }
            del.sync(constants.VENDOR_OUTPUT)
            var compiler = webpack(vendorConfig)
            compiler.run(function(err, stats) {
                vendorManifest(stats, vendors, join(constants.VENDOR_OUTPUT, vendorSourceMap))
                if (typeof hooks.afterVendor === 'function') {
                    hooks.afterVendor(err, stats)
                }
                if (typeof afterVendor === 'function') {
                    afterVendor(err, stats)
                }
                callback('build vendor success!', err, stats)
                if (next) next()
            })
        },
        dev(options) {
            const runDev = developServer(context, constants)
            if (checkVendor(vendors, join(constants.VENDOR_OUTPUT, vendorSourceMap))) {
                runDev(options)
            } else {
                tasks.vendor(runDev.bind(null, options))
            }
        }
    }
    return tasks
}