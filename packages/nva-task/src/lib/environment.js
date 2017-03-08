import path from 'path'
import {
    moduleConfig as moduleConfigFactory,
    vendorConfig as vendorConfigFactory,
    webpackConfig as webpackConfigFactory,
    nvaConfig as nvaConfigFactory,
    getLanIP
} from './helper'

const moduleConfig = moduleConfigFactory()
const vendorConfig = vendorConfigFactory()
const webpackConfig = webpackConfigFactory()
const nvaConfig = nvaConfigFactory()
const nvaType = nvaConfig['type']

let env = {
    entryJSExt: '.js',
    entryCSSExt: '.css',
    buildFolder: "build",
    distFolder: "dist",
    bundleFolder: "bundle",
    vendorFolder: "vendor",

    assetFolder: 'asset',
    cssFolder: '',
    spriteFolder: 'sprites',
    fontFolder: 'font',
    imageFolder: 'image',

    sourcePath: "src",
    clientPath: "",
    pageFolder: "page",
    hmrPath: "/hmr/",
    moduleConfig,
    nvaConfig
}
env.pagePath = path.join(env.sourcePath, env.pageFolder)
env.lanIP = getLanIP()
env.reloaderPort = process.env.RELOADER_PORT || 7000;
env.hmrPort = process.env.HMR_PORT || 5000;
env.reloaderHost = "http://" + env.lanIP + ":" + env.reloaderPort

let _sourcePath = env.sourcePath
if (nvaType === 'isomorphic') {
    env = {
        ...env,
        pagePath: 'view',
        cssFolder: 'stylesheet',
        moduleFolder: 'module',
        serverFolder: 'server',
        serverEntryJS: 'bootstrap.js',
        clientPath: "client",
        entryJSExt: '.jsx'
    }
    _sourcePath = env.clientPath
}

delete nvaConfig['type']

env = {
    ...env,
    ...nvaConfig
}

let modules = []
if (moduleConfig) {
    for (let moduleName in moduleConfig) {
        let moduleObj = moduleConfig[moduleName]
        let entryJS = moduleObj.entryJS || (moduleName + env.entryJSExt)
        let entryCSS = moduleObj.entryCSS || (moduleName + env.entryCSSExt)
        let entryHtml = []

        entryJS = path.resolve(path.join(_sourcePath, env.bundleFolder, moduleObj.path, entryJS))
        entryCSS = path.resolve(path.join(_sourcePath, env.bundleFolder, moduleObj.path, entryCSS))
        if (typeof moduleObj.html === 'string') {
            entryHtml = [path.join(env.pagePath, moduleObj.html)]
        } else if (Array.isArray(moduleObj.html)) {
            entryHtml = moduleObj.html.map(function(v) {
                return path.join(env.pagePath, v)
            })
        }
        modules.push({
            ...moduleObj,
            name: moduleName,
            entryCSS,
            entryJS,
            html: entryHtml
        })
    }
}

env.modules = modules
env.vendors = vendorConfig
env.webpackConfig = webpackConfig

export default env