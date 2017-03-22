import webpack from 'webpack'
import chalk from 'chalk'
import del from 'del'
import path from 'path'
import { DEBUG, env, mergeConfig } from '../lib'
import fs from 'fs-extra'
import { writeToModuleConfig } from '../lib/helper'
import vendorFactory from '../base/vendor'
import releaseConfigFactory from './webpack.production'
import developServerFactory from './develop-server'

function callback(info, err, stats) {
    if (err || stats.hasErrors()) {
        console.log(chalk.red(err, stats))
        return
    }
    console.log('😌  ' + info)
    console.log(stats.toString({
        version: false,
        chunks: false,
        colors: true
    }))
}

const constants = {
    CSS_OUTPUT: path.join(env.distFolder, "[name]", "[name]-[hash:8].css"),
    HAPPYPACK_TEMP_DIR: path.join('.nva','temp','happypack'),
    OUTPUT_PATH: path.resolve(process.cwd()),
    ASSET_IMAGE_OUTPUT: path.join(env.distFolder, env.assetFolder, env.imageFolder, path.sep),
    ASSET_FONT_OUTPUT: path.join(env.distFolder, env.assetFolder, env.fontFolder, path.sep),
    SPRITE_OUTPUT: path.join(env.distFolder, env.assetFolder, 'new'),
    IMAGE_PREFIX: path.join('..', env.assetFolder, env.imageFolder),
    FONT_PREFIX: path.join('..', env.assetFolder, env.fontFolder),
    VENDOR_OUTPUT: path.resolve(path.join(process.cwd(),env.distFolder, env.vendorFolder)),
    MANIFEST_PATH: path.join(env.distFolder, env.vendorFolder),
    DEBUG
}

export function addModule(name, config, templateModule) {
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
        writeToModuleConfig(_moduleConfig)
        let _html = _template ? path.join(env.pagePath, `${_template}.html`) : '',
            _source = _template ? path.join(env.sourcePath, env.bundleFolder, _template) : ''
        if (fs.existsSync(_html)) {
            fs.copySync(_html, path.join(env.pagePath, `${_name}.html`))
        } else {
            fs.ensureFileSync(path.join(env.pagePath, `${_name}.html`))
        }
        if (fs.existsSync(_source)) {
            fs.copySync(_source, path.join(env.sourcePath, env.bundleFolder, _name))
        } else {
            fs.ensureFileSync(path.join(env.sourcePath, env.bundleFolder, _name, `${_name}.js`))
            fs.ensureFileSync(path.join(env.sourcePath, env.bundleFolder, _name, `${_name}.css`))
        }
    })
}

export function removeModule(name) {
    let _moduleConfig = { ...env.moduleConfig }
    let names = name.split(',')
    names.forEach(function(_name) {
        if (_moduleConfig[_name]) {
            delete _moduleConfig[_name]
        }
        writeToModuleConfig(_moduleConfig)
        let _html = path.join(env.pagePath, `${_name}.html`),
            _client = path.join(env.sourcePath, env.bundleFolder, _name)
        if (fs.existsSync(_html)) {
            fs.removeSync(_html)
        } else {
            console.log(chalk.red(`htmls of module '${_name}' not existed,maybe module '${_name}' have been removed?`))
            return
        }
        if (fs.existsSync(_client)) {
            fs.removeSync(_client)
        } else {
            console.log(chalk.red(`bundle directory of module '${_name}' not existed,maybe module '${_name}' have been removed?`))
            return
        }
    })
}

export function build() {
    let releaseConfig = mergeConfig(releaseConfigFactory(env, constants))
    /** clean build assets*/
    env.modules.forEach(function(moduleObj) {
        del.sync(path.join(env.distFolder, moduleObj.name))
    })
    let compiler = webpack(releaseConfig)
    compiler.run(function(err, stats) {
        callback('build success!', err, stats)
    })
}

export function vendor() {
    let vendorConfig = mergeConfig(vendorFactory(env, constants))
    del.sync([path.join(env.distFolder, env.vendorFolder, '*.*')])
    var compiler = webpack(vendorConfig)
    compiler.run(function(err, stats) {
        callback('build vendor success!', err, stats)
    })
}

export const developServer = developServerFactory(env, constants)