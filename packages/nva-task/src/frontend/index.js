import webpack from 'webpack'
import chalk from 'chalk'
import del from 'del'
import { join, resolve, sep } from 'path'
import { omit } from 'lodash'
import { DEBUG, writeToModuleConfig, vendorManifest, mergeConfig, checkVendor } from '../lib'
import fs from 'fs-extra'
import { callback } from '../lib/helper'
import vendorFactory from '../lib/vendor'
import releaseConfigFactory from './webpack.production'
import developServer from './develop-server'

module.exports = context => {
    let {
        distFolder,
        sourceFolder,
        vendorFolder,
        bundleFolder,
        assetFolder,
        imageFolder,
        fontFolder,
        spriteFolder,
        confFolder,
        moduleConf,
        moduleConfPath,
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
        SPRITE_OUTPUT: join(distFolder, assetFolder, spriteFolder),
        IMAGE_PREFIX: join('..', assetFolder, imageFolder),
        FONT_PREFIX: join('..', assetFolder, fontFolder),
        VENDOR_OUTPUT: resolve(distFolder, vendorFolder),
        MANIFEST_PATH: join(distFolder, vendorFolder),
        DEBUG
    }

    const tasks = {
        addModule(name, config, template) {
            let names = name.split(',')
            let _template = template || 'index'
            let _moduleConf = {}
            names.forEach(function(_name) {
                if (Object.keys(moduleConf).indexOf(_name) > -1) {
                    console.log(chalk.red('name existed!'))
                    return
                }
                _moduleConf[_name] = {
                    path: config.path || _name,
                    html: config.html ? config.html.spit(',') : `${_name}.html`
                }

                let from = join(sourceFolder, bundleFolder, _template)
                let to = join(sourceFolder, bundleFolder, _name)
                if (fs.existsSync(from)) {
                    fs.copySync(from, to)
                } else {
                    fs.ensureFileSync(join(to, `${_name}.js`))
                    fs.ensureFileSync(join(to, `${_name}.css`))
                    fs.ensureFileSync(join(to, `${_name}.html`))
                }
            })
            _moduleConf = { ...moduleConf, ..._moduleConf }
            writeToModuleConfig(moduleConfPath, _moduleConf)
        },
        removeModule(name) {
            let names = name.split(',')
            let _moduleConf = omit(moduleConf, names)
            writeToModuleConfig(moduleConfPath, _moduleConf)
            names.forEach(function(_name) {
                let to = join(sourceFolder, bundleFolder, _name)
                to = _name === modules[_name].path ? modules[_name].path : to
                if (fs.existsSync(to)) {
                    fs.removeSync(to)
                } else {
                    console.log(chalk.red(`bundle directory of module '${_name}' not existed,maybe module '${_name}' have been removed?`))
                    return
                }
            })
        },
        build({ profile }) {
            if (checkVendor(vendors, join(constants.VENDOR_OUTPUT, vendorSourceMap)) === false) {
                console.log('vendor')
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
                if (moduleObj.path) {
                    del.sync(join(distFolder, moduleObj.path))
                } else {
                    del.sync(join(distFolder, '*.*'))
                }
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
            del.sync([join(distFolder, vendorFolder, '*.*')])
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