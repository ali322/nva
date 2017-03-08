import webpack from 'webpack'
import chalk from 'chalk'
import del from 'del'
import fs from 'fs-extra'
import path from 'path'
import { DEBUG, env,mergeConfig } from '../lib'
import { writeToModuleConfig } from '../lib/helper'
import vendorFactory from '../base/vendor'
import serverConfigFactory from './webpack.server'
import clientConfigFactory from './webpack.client'
import developServerFactory from './develop-server'

function callback(info, err, stats) {
    if (err || stats.hasErrors()) {
        console.log(chalk.red(err, stats))
        return
    }
    console.log('😌  ' + info)
    console.log(stats.toString({
        chunks: false,
        version: false,
        colors: true
    }))
}

const constants = {
    OUTPUT_PATH: path.resolve(path.join(process.cwd(), env.clientPath)),
    ASSET_IMAGE_OUTPUT: path.join(env.distFolder, env.assetFolder, env.imageFolder, path.sep),
    ASSET_FONT_OUTPUT: path.join(env.distFolder, env.assetFolder, env.fontFolder, path.sep),
    SPRITE_OUTPUT: path.join(env.clientPath, env.assetFolder, env.spriteFolder),
    ASSET_INPUT: path.join(env.clientPath, env.assetFolder),
    IMAGE_PREFIX: path.join('..', '..', '..', env.distFolder, env.assetFolder, env.imageFolder),
    FONT_PREFIX: path.join('..', '..', env.distFolder, env.assetFolder, env.fontFolder),
    VENDOR_OUTPUT: path.join(env.clientPath, env.distFolder, env.vendorFolder),
    MANIFEST_PATH: path.join(env.clientPath, env.distFolder, env.vendorFolder),
    DEBUG
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
            _client = path.join(env.clientPath, env.bundleFolder, _name)
        if (fs.existsSync(_html)) {
            fs.removeSync(_html)
        } else {
            console.log(chalk.red(`htmls of module '${_name}' not existed,maybe module '${_name}' have been removed?`))
            return
        }
        if (fs.existsSync(_client)) {
            fs.removeSync(_client)
        } else {
            console.log(chalk.red(`client bundle of module '${_name}' not existed,maybe module '${_name}' have been removed?`))
            return
        }
    })
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
            _client = _template ? path.join(env.clientPath, env.bundleFolder, _template) : ''
        if (fs.existsSync(_html)) {
            fs.copySync(_html, path.join(env.pagePath, `${_name}.html`))
        } else {
            fs.ensureFileSync(path.join(env.pagePath, `${_name}.html`))
        }
        if (fs.existsSync(_client)) {
            fs.copySync(_client, path.join(env.clientPath, env.bundleFolder, _name))
        } else {
            fs.ensureFileSync(path.join(env.clientPath, env.bundleFolder, _name, `${_name}.js`))
            fs.ensureFileSync(path.join(env.clientPath, env.bundleFolder, _name, `${_name}.css`))
        }
    })
}

export function build() {
    let serverConfig = serverConfigFactory(env)
    let clientConfig = mergeConfig(clientConfigFactory(env, constants))
    del.sync(path.join('server', env.distFolder))
    /** clean dist */
    // del.sync([path.join(env.clientPath, env.distFolder, env.assetFolder)])
    env.modules.forEach(function(moduleObj) {
        del.sync(path.join(env.clientPath, env.distFolder, moduleObj.path, '/*.*'));
    })
    let compiler = webpack([clientConfig, serverConfig])
    compiler.run(function(err, stats) {
        callback('build success!', err, stats)
    })
}

export function vendor() {
    let vendorConfig = mergeConfig(vendorFactory(env, constants))
    console.log('vendorConfig',vendorConfig)
    del.sync([path.join(env.clientPath, env.distFolder, env.vendorFolder, '*.*')])
    let compiler = webpack(vendorConfig)
    compiler.run(function(err, stats) {
        callback('build vendor success!', err, stats)
    })
}

export const developServer = developServerFactory(env, constants)