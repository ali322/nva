import path from 'path'
import { getLanIP } from './helper'

export default function(context) {
    const { type, proj, modules, vendors } = context
    const isIsomorphic = type === 'isomorphic'

    let env = {
        sourcePath: "src",
        clientPath: "",
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

        hmrPath: "/hmr/",
        enableMock: true
    }

    let lanIP = getLanIP()
    env.reloaderPort = process.env.RELOADER_PORT || 7000;
    env.reloaderHost = "http://" + lanIP + ":" + env.reloaderPort

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

    env = { ...env, ...proj }

    let _modules = {}
    if (modules) {
        for (let moduleName in modules) {
            let moduleObj = modules[moduleName]
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
                entryHtml = [
                    env.pagePath ? path.join(env.pagePath, moduleObj.html) :
                    path.join(_sourcePath, env.bundleFolder, moduleObj.path, moduleObj.html)
                ]
            } else if (Array.isArray(moduleObj.html)) {
                entryHtml = moduleObj.html.map(function(v) {
                    return env.pagePath ? path.join(env.pagePath, v) : path.join(_sourcePath, env.bundleFolder, moduleObj.path, v)
                })
            }
            _modules[moduleName] = {
                ...moduleObj,
                ...(isIsomorphic ? { bundleEntry } : null),
                entryCSS,
                entryJS,
                html: entryHtml
            }
        }
    }

    env.modules = _modules
    env.vendors = vendors

    return {
        ...context,
        env
    }
}