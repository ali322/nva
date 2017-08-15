import { join, resolve, sep } from 'path'
import { forEach, isString } from 'lodash'
import webpack from 'webpack'
import chalk from 'chalk'
import del from 'del'
import { addMod, removeMod } from '../lib/mod'
import { vendorManifest, mergeConfig, checkVendor } from '../lib'
import { callback } from '../lib/helper'
import vendorFactory from '../lib/vendor'
import serverConfigFactory from './webpack.server'
import clientConfigFactory from './webpack.client'
import bundleConfigFactory from './webpack.bundle'
import developServer from './develop-server'

module.exports = context => {
    let {
        serverFolder,
        distFolder,
        chunkFolder,
        sourceFolder,
        vendorFolder,
        bundleFolder,
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

    function createBundle(constants, profile) {
        let bundleConfig = bundleConfigFactory(context, constants, profile)
        del.sync(join(serverFolder, bundleFolder))
        if (Object.keys(bundleConfig.entry).length === 0) {
            return
        }
        let bundleCompiler = webpack(bundleConfig)

        function cb(err, stats) {
            if (err) throw err
            stats = stats.toJson()
            stats.errors.forEach(err => console.error(err))
            stats.warnings.forEach(err => console.warn(err))
            console.log(chalk.magenta('server side bundle is now VALID.'))
        }
        if (constants.HOT) {
            bundleCompiler.watch({}, cb)
        } else {
            bundleCompiler.run(cb)
        }
    }

    const constants = {
        CSS_OUTPUT: join("[name]", "[name]-[hash:8].css"),
        OUTPUT_PATH: resolve(distFolder, sourceFolder),
        IMAGE_OUTPUT: join(assetFolder, imageFolder, sep),
        FONT_OUTPUT: join(assetFolder, fontFolder, sep),
        IMAGE_PREFIX: imagePrefix || join('..', assetFolder, imageFolder, sep),
        FONT_PREFIX: fontPrefix || join('..', assetFolder, fontFolder, sep),
        VENDOR_OUTPUT: resolve(distFolder, sourceFolder, vendorFolder),
        MANIFEST_PATH: join(distFolder, sourceFolder, vendorFolder),
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

            let serverConfig = serverConfigFactory(context, constants, profile)
            let clientConfig = clientConfigFactory(context, constants, profile)
            if (typeof hooks.beforeBuild === 'function') {
                clientConfig = mergeConfig(clientConfig, hooks.beforeBuild(clientConfig))
            }
            if (typeof beforeBuild === 'function') {
                clientConfig = mergeConfig(clientConfig, beforeBuild(clientConfig))
            }
            del.sync(join(distFolder, serverFolder))
            /** clean dist */
            forEach(mods, (mod, name) => {
                Object.keys(mod.output).forEach(v => {
                    if (isString(mod.output[v])) {
                        del.sync(mod.output[v])
                    }
                })
                del.sync(join(distFolder, sourceFolder, name))
            })
            del.sync(join(distFolder, chunkFolder))

            createBundle({ ...constants, HOT: false }, profile)
            let compiler = webpack([clientConfig, serverConfig])
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
            let compiler = webpack(vendorConfig)
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
            createBundle({ ...constants, HOT: true }, options.profile)
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