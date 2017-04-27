import webpack from 'webpack'
import chalk from 'chalk'
import del from 'del'
import path from 'path'
import { DEBUG, writeToModuleConfig, vendorManifest, mergeConfig } from '../lib'
import fs from 'fs-extra'
import { callback } from '../lib/helper'
import vendorFactory from '../lib/vendor'
import releaseConfigFactory from './webpack.production'
import developServerFactory from './develop-server'

module.exports = context => {
    let { env, moduleConfPath } = context

    const constants = {
        CSS_OUTPUT: path.join(env.distFolder, "[name]", "[name]-[hash:8].css"),
        HAPPYPACK_TEMP_DIR: path.join('.nva', 'temp', 'happypack'),
        OUTPUT_PATH: path.resolve(process.cwd()),
        ASSET_IMAGE_OUTPUT: path.join(env.distFolder, env.assetFolder, env.imageFolder, path.sep),
        ASSET_FONT_OUTPUT: path.join(env.distFolder, env.assetFolder, env.fontFolder, path.sep),
        SPRITE_OUTPUT: path.join(env.distFolder, env.assetFolder, env.spriteFolder),
        IMAGE_PREFIX: path.join('..', env.assetFolder, env.imageFolder),
        FONT_PREFIX: path.join('..', env.assetFolder, env.fontFolder),
        VENDOR_OUTPUT: path.resolve(path.join(process.cwd(), env.distFolder, env.vendorFolder)),
        MANIFEST_PATH: path.join(env.distFolder, env.vendorFolder),
        DEBUG
    }

    return {
        addModule(name, config, templateModule) {
            let _moduleConfig = { ...env.moduleConfig }
            let names = name.split(',')
            let _template = templateModule || false
            if (_template) {
                _template = typeof _template === 'string' ? _template : 'index'
            }
            names.forEach(function(_name) {
                _moduleConfig[_name] = {
                    name: _name,
                    path: config.path || _name,
                    html: config.html ? config.html.spit(',') : [`${_name}.html`]
                }
                writeToModuleConfig(moduleConfPath, _moduleConfig)
                let _source = _template ? path.join(env.sourcePath, env.bundleFolder, _template) : ''
                if (fs.existsSync(_source)) {
                    fs.copySync(_source, path.join(env.sourcePath, env.bundleFolder, _name))
                } else {
                    fs.ensureFileSync(path.join(env.sourcePath, env.bundleFolder, _name, `${_name}.js`))
                    fs.ensureFileSync(path.join(env.sourcePath, env.bundleFolder, _name, `${_name}.css`))
                    fs.ensureFileSync(path.join(env.sourcePath, env.bundleFolder, _name, `${_name}.html`))
                }
            })
        },
        removeModule(name) {
            let _moduleConfig = { ...env.moduleConfig }
            let names = name.split(',')
            names.forEach(function(_name) {
                if (_moduleConfig[_name]) {
                    delete _moduleConfig[_name]
                }
                writeToModuleConfig(moduleConfPath, _moduleConfig)
                let _source = path.join(env.sourcePath, env.bundleFolder, _name)
                if (fs.existsSync(_source)) {
                    fs.removeSync(_source)
                } else {
                    console.log(chalk.red(`bundle directory of module '${_name}' not existed,maybe module '${_name}' have been removed?`))
                    return
                }
            })
        },
        build({ profile }) {
            let releaseConfig = releaseConfigFactory(env, constants, profile)
            if (typeof context.beforeBuild === 'function') {
                releaseConfig = mergeConfig(releaseConfig, context.beforeBuild(releaseConfig))
            }
            /** clean build assets*/
            env.modules.forEach(function(moduleObj) {
                del.sync(path.join(env.distFolder, moduleObj.name))
            })
            let compiler = webpack(releaseConfig)
            compiler.run(function(err, stats) {
                if (typeof context.afterBuild === 'function') {
                    context.afterBuild(err, stats)
                }
                callback('build success!', err, stats)
            })
        },
        vendor() {
            let vendorConfig = vendorFactory(env, constants)
            if (typeof context.beforeVendor === 'function') {
                vendorConfig = mergeConfig(vendorConfig, context.beforeVendor(vendorConfig))
            }
            del.sync([path.join(env.distFolder, env.vendorFolder, '*.*')])
            var compiler = webpack(vendorConfig)
            compiler.run(function(err, stats) {
                vendorManifest(stats, constants.VENDOR_OUTPUT)
                if (typeof context.afterVendor === 'function') {
                    context.afterVendor(err, stats)
                }
                callback('build vendor success!', err, stats)
            })
        },
        dev: developServerFactory(context, constants)
    }
}