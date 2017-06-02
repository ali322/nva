import webpack from 'webpack'
import del from 'del'
import { join, resolve, sep } from 'path'
import { addModule, removeModule } from '../lib/mod'
import { vendorManifest, mergeConfig, checkVendor } from '../lib'
import { callback } from '../lib/helper'
import vendorFactory from '../lib/vendor'
import releaseConfigFactory from './webpack.production'
import developServer from './develop-server'

module.exports = context => {
    let {
        distFolder,
        vendorFolder,
        assetFolder,
        imageFolder,
        fontFolder,
        confFolder,
        beforeBuild,
        afterBuild,
        beforeVendor,
        afterVendor,
        modules,
        vendors,
        vendorSourceMap
    } = context

    const constants = {
        CSS_OUTPUT: join(distFolder, "[name]", "[name]-[hash:8].css"),
        HAPPYPACK_TEMP_DIR: join(confFolder, 'temp', 'happypack'),
        OUTPUT_PATH: resolve(),
        ASSET_IMAGE_OUTPUT: join(distFolder, assetFolder, imageFolder, sep),
        ASSET_FONT_OUTPUT: join(distFolder, assetFolder, fontFolder, sep),
        IMAGE_PREFIX: join('..', assetFolder, imageFolder),
        FONT_PREFIX: join('..', assetFolder, fontFolder),
        VENDOR_OUTPUT: resolve(distFolder, vendorFolder),
        MANIFEST_PATH: join(distFolder, vendorFolder),
    }

    const tasks = {
        addModule(names, answers, template) {
            addModule(names, answers, template, context)
        },
        removeModule(names) {
            removeModule(names, context)
        },
        build({ profile }) {
            if (checkVendor(vendors, join(constants.VENDOR_OUTPUT, vendorSourceMap)) === false) {
                tasks.vendor()
                return
            }
            let releaseConfig = releaseConfigFactory(context, constants, profile)
            if (typeof beforeBuild === 'function') {
                releaseConfig = mergeConfig(releaseConfig, beforeBuild(releaseConfig))
            }
            /** clean build assets*/
            for (let moduleName in modules) {
                let moduleObj = modules[moduleName]
                Object.keys(moduleObj.output).forEach(v => {
                    del.sync(v)
                })
                del.sync(join(distFolder, moduleName))
            }
            let compiler = webpack(releaseConfig)
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
            del.sync([join(distFolder, vendorFolder)])
            var compiler = webpack(vendorConfig)
            compiler.run(function(err, stats) {
                vendorManifest(stats, join(constants.VENDOR_OUTPUT, vendorSourceMap))
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