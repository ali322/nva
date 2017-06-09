import { join, resolve, sep } from 'path'
import { forEach } from 'lodash'
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
        mods,
        vendors,
        vendorSourceMap,
        cachePath
    } = context

    function createBundle(constants) {
        let bundleConfig = bundleConfigFactory(context, constants)
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
        CSS_OUTPUT: join(distFolder, "[name]", "[name]-[contenthash:8].css"),
        OUTPUT_PATH: resolve(sourceFolder),
        IMAGE_OUTPUT: join(distFolder, assetFolder, imageFolder, sep),
        FONT_OUTPUT: join(distFolder, assetFolder, fontFolder, sep),
        IMAGE_PREFIX: imagePrefix || join('..', '..', '..', distFolder, assetFolder, imageFolder),
        FONT_PREFIX: fontPrefix || join('..', '..', distFolder, assetFolder, fontFolder),
        VENDOR_OUTPUT: resolve(sourceFolder, distFolder, vendorFolder),
        MANIFEST_PATH: join(sourceFolder, distFolder, vendorFolder),
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
            if (typeof beforeBuild === 'function') {
                clientConfig = mergeConfig(clientConfig, beforeBuild(clientConfig))
            }
            del.sync(join(serverFolder, distFolder))
            /** clean dist */
            forEach(mods, (mod, name) => {
                Object.keys(mod.output).forEach(v => {
                    del.sync(mod.output[v])
                })
                del.sync(join(sourceFolder, distFolder, name))
            })

            createBundle({ ...constants, HOT: false })
            let compiler = webpack([clientConfig, serverConfig])
            compiler.run(function(err, stats) {
                if (typeof afterBuild === 'function') {
                    afterBuild(err, stats)
                }
                callback('build success!', err, stats)
            })
        },
        vendor(next) {
            let vendorConfig = vendorFactory(context, constants)
            if (typeof beforeVendor === 'function') {
                vendorConfig = mergeConfig(vendorConfig, beforeVendor(vendorConfig))
            }
            del.sync([join(sourceFolder, distFolder, vendorFolder)])
            let compiler = webpack(vendorConfig)
            compiler.run(function(err, stats) {
                vendorManifest(stats, vendors, join(constants.VENDOR_OUTPUT, vendorSourceMap))
                if (typeof afterVendor === 'function') {
                    afterVendor(err, stats)
                }
                callback('build vendor success!', err, stats)
                if (next) next()
            })
        },
        dev(options) {
            createBundle({ ...constants, HOT: true })
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