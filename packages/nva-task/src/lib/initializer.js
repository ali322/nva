import { join, resolve } from 'path'
import { omit } from 'lodash'

export default function(context) {
    const { proj, modules } = context
    const isIsomorphic = proj.type === 'isomorphic'

    let _proj = {
        sourceFolder: "src",
        clientPath: "",
        jsExt: '.js',
        cssExt: '.css',
        htmlExt: '.html',
        buildFolder: "build",
        distFolder: "dist",
        bundleFolder: "bundle",
        vendorFolder: "vendor",

        assetFolder: 'asset',
        cssFolder: '',
        fontFolder: 'font',
        imageFolder: 'image',

        vendorSourceMap: 'sourcemap.json',
        hmrPath: "/hmr/",
        enableMock: true
    }

    if (isIsomorphic) {
        _proj = {
            ..._proj,
            cssFolder: 'stylesheet',
            moduleFolder: 'module',
            serverFolder: 'server',
            serverEntry: 'bootstrap.js',
            sourceFolder: "client",
        }
    }

    _proj = { ..._proj, ...proj }

    let _modules = {}
    if (modules) {
        for (let moduleName in modules) {
            let moduleObj = modules[moduleName]

            _modules[moduleName] = {
                ...moduleObj,
                ...(initModule(moduleObj, moduleName, _proj))
            }
        }
    }

    return {
        ...(omit(context, ['modules', 'proj'])),
        modules: _modules,
        ..._proj
    }
}

export function initModule(moduleObj, moduleName, context) {
    const { sourceFolder, bundleFolder, jsExt, cssExt, htmlExt } = context

    // input
    let input = { ...moduleObj.input } || {}
    input.js = input.js || join(sourceFolder, bundleFolder, moduleName, moduleName + jsExt)
    input.css = input.css || join(sourceFolder, bundleFolder, moduleName, moduleName + cssExt)
    input.html = input.html || join(sourceFolder, bundleFolder, moduleName, moduleName + htmlExt)
    input.js = resolve(input.js)
    input.css = resolve(input.css)
    input.html = resolve(input.html)

    //output
    let output = moduleObj.output || {}

    return { input, output }
}