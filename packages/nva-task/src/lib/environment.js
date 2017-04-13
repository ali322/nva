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
delete nvaConfig['type']
const isIsomorphic = nvaType === 'isomorphic'

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
if (isIsomorphic) {
    env = {
        ...env,
        pagePath: 'view',
        cssFolder: 'stylesheet',
        moduleFolder: 'module',
        serverFolder: 'server',
        serverEntry: 'bootstrap.js',
        clientPath: "client",
        entryJSExt: '.jsx'
    }
    _sourcePath = env.clientPath
}

env = {
    ...env,
    ...nvaConfig
}

let modules = []
if (moduleConfig) {
    for (let moduleName in moduleConfig) {
        let moduleObj = moduleConfig[moduleName]
        let entryJS = moduleObj.entryJS === undefined ? (moduleName + env.entryJSExt) : moduleObj.entryJS
        let entryCSS = moduleObj.entryCSS === undefined ? (moduleName + env.entryCSSExt) : moduleObj.entryCSS
        let bundleEntry = moduleObj.bundleEntry || (moduleName + '-server' + env.entryJSExt)
        let entryHtml = []

        entryJS = path.resolve(path.join(_sourcePath, env.bundleFolder, moduleObj.path, entryJS))
        entryCSS = path.resolve(path.join(_sourcePath, env.bundleFolder, moduleObj.path, entryCSS))
        if (isIsomorphic) {
            bundleEntry = path.resolve(path.join(_sourcePath, env.bundleFolder, moduleObj.path, bundleEntry))
        }
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
            ...(isIsomorphic ? { bundleEntry } : null),
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