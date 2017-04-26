import webpack from 'webpack'
import chalk from 'chalk'
import del from 'del'
import fs from 'fs-extra'
import path from 'path'
import { DEBUG, env, mergeConfig } from '../lib'
import { writeToModuleConfig, vendorManifest } from '../lib/helper'
import vendorFactory from '../lib/vendor'
import serverConfigFactory from './webpack.server'
import clientConfigFactory from './webpack.client'
import bundleConfigFactory from './webpack.bundle'
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

function createBundle(constants) {
    let bundleConfig = bundleConfigFactory(env, constants)
    del.sync(path.join(env.serverFolder, env.bundleFolder))
    bundleConfig = mergeConfig(bundleConfig)
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
    CSS_OUTPUT: path.join(env.distFolder, "[name]", "[name]-[contenthash:8].css"),
    HAPPYPACK_TEMP_DIR: path.join('.nva', 'temp', 'happypack'),
    OUTPUT_PATH: path.resolve(path.join(process.cwd(), env.clientPath)),
    ASSET_IMAGE_OUTPUT: path.join(env.distFolder, env.assetFolder, env.imageFolder, path.sep),
    ASSET_FONT_OUTPUT: path.join(env.distFolder, env.assetFolder, env.fontFolder, path.sep),
    SPRITE_OUTPUT: path.join(env.clientPath, env.assetFolder, env.spriteFolder),
    IMAGE_PREFIX: path.join('..', '..', '..', env.distFolder, env.assetFolder, env.imageFolder),
    FONT_PREFIX: path.join('..', '..', env.distFolder, env.assetFolder, env.fontFolder),
    VENDOR_OUTPUT: path.resolve(path.join(process.cwd(), env.clientPath, env.distFolder, env.vendorFolder)),
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

export function build({ profile }) {
    let serverConfig = mergeConfig(serverConfigFactory(env, constants, profile))
    let clientConfig = mergeConfig(clientConfigFactory(env, constants, profile))
    del.sync(path.join(env.serverFolder, env.distFolder))
    /** clean dist */
    env.modules.forEach(function(moduleObj) {
        del.sync(path.join(env.clientPath, env.distFolder, moduleObj.path, '/*.*'));
    })
    createBundle({ ...constants, HOT: false })
    let compiler = webpack([clientConfig, serverConfig])
    compiler.run(function(err, stats) {
        callback('build success!', err, stats)
    })
}

export function vendor() {
    let vendorConfig = mergeConfig(vendorFactory(env, constants))
    del.sync([path.join(env.clientPath, env.distFolder, env.vendorFolder, '*.*')])
    let compiler = webpack(vendorConfig)
    compiler.run(function(err, stats) {
        vendorManifest(stats, constants.VENDOR_OUTPUT)
        callback('build vendor success!', err, stats)
    })
}

export function developServer(options) {
    createBundle({ ...constants, HOT: true })
    developServerFactory(env, constants)(options)
}