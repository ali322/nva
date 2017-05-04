import { join, resolve, sep } from 'path'
import webpack from 'webpack'
import chalk from 'chalk'
import { omit } from 'lodash'
import del from 'del'
import fs from 'fs-extra'
import { writeToModuleConfig, vendorManifest, mergeConfig, DEBUG } from '../lib'
import { callback } from '../lib/helper'
import vendorFactory from '../lib/vendor'
import serverConfigFactory from './webpack.server'
import clientConfigFactory from './webpack.client'
import bundleConfigFactory from './webpack.bundle'
import developServerFactory from './develop-server'

module.exports = context => {
    let {
        serverFolder,
        distFolder,
        sourceFolder,
        vendorFolder,
        bundleFolder,
        pagePath,
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
        modules
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
        HAPPYPACK_TEMP_DIR: join(confFolder, 'temp', 'happypack'),
        OUTPUT_PATH: resolve(sourceFolder),
        ASSET_IMAGE_OUTPUT: join(distFolder, assetFolder, imageFolder, sep),
        ASSET_FONT_OUTPUT: join(distFolder, assetFolder, fontFolder, sep),
        SPRITE_OUTPUT: join(sourceFolder, assetFolder, spriteFolder),
        IMAGE_PREFIX: join('..', '..', '..', distFolder, assetFolder, imageFolder),
        FONT_PREFIX: join('..', '..', distFolder, assetFolder, fontFolder),
        VENDOR_OUTPUT: resolve(sourceFolder, distFolder, vendorFolder),
        MANIFEST_PATH: join(sourceFolder, distFolder, vendorFolder),
        DEBUG
    }

    return {
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
                let fromHTML = join(pagePath, `${_template}.html`)
                let toHTML = join(pagePath, `${_name}.html`)
                if (fs.existsSync(fromHTML)) {
                    fs.copySync(fromHTML, toHTML)
                } else {
                    fs.ensureFileSync(toHTML)
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
                if (fs.existsSync(to)) {
                    fs.removeSync(to)
                } else {
                    console.log(chalk.red(`bundle directory of module '${_name}' not existed,maybe module '${_name}' have been removed?`))
                    return
                }
                let toHTML = join(pagePath, `${_name}.html`)
                if (fs.existsSync(toHTML)) {
                    fs.removeSync(toHTML)
                } else {
                    console.log(chalk.red(`htmls of module '${_name}' not existed,maybe module '${_name}' have been removed?`))
                    return
                }
            })
        },
        build({ profile }) {
            let serverConfig = serverConfigFactory(context, constants, profile)
            let clientConfig = clientConfigFactory(context, constants, profile)

            if (typeof beforeBuild === 'function') {
                clientConfig = mergeConfig(clientConfig, beforeBuild(clientConfig))
            }
            del.sync(join(serverFolder, distFolder))
            /** clean dist */
            for (let moduleName in modules) {
                let moduleObj = modules[moduleName]
                del.sync(join(sourceFolder, distFolder, moduleObj.path, '/*.*'));
            }
            createBundle({ ...constants, HOT: false })
            let compiler = webpack([clientConfig, serverConfig])
            compiler.run(function(err, stats) {
                if (typeof afterBuild === 'function') {
                    afterBuild(err, stats)
                }
                callback('build success!', err, stats)
            })
        },
        vendor() {
            let vendorConfig = vendorFactory(context, constants)
            if (typeof beforeVendor === 'function') {
                vendorConfig = mergeConfig(vendorConfig, beforeVendor(vendorConfig))
            }
            del.sync([join(sourceFolder, distFolder, vendorFolder, '*.*')])
            let compiler = webpack(vendorConfig)
            compiler.run(function(err, stats) {
                vendorManifest(stats, constants.VENDOR_OUTPUT)
                if (typeof afterVendor === 'function') {
                    afterVendor(err, stats)
                }
                callback('build vendor success!', err, stats)
            })
        },
        dev(options) {
            createBundle({ ...constants, HOT: true })
            developServerFactory(context, constants)(options)
        }
    }
}