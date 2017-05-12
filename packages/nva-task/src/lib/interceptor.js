import { join, resolve } from 'path'
import { omit } from 'lodash'

export default function(context) {
    const { proj, modules } = context
    const isIsomorphic = proj.type === 'isomorphic'

    let _proj = {
        sourceFolder: "src",
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

    if (isIsomorphic) {
        _proj = {
            ..._proj,
            pagePath: 'view',
            cssFolder: 'stylesheet',
            moduleFolder: 'module',
            serverFolder: 'server',
            serverEntry: 'bootstrap.js',
            sourceFolder: "client",
        }
    }

    _proj = { ..._proj, ...proj }

    const { pagePath, sourceFolder, bundleFolder, entryJSExt, entryCSSExt } = _proj

    let _modules = {}
    if (modules) {
        for (let moduleName in modules) {
            let moduleObj = modules[moduleName]
            let entryJS = moduleObj.entryJS || (moduleName + entryJSExt)
            let entryCSS = moduleObj.entryCSS || (moduleName + entryCSSExt)
            entryJS = resolve(join(sourceFolder, bundleFolder, moduleObj.path, entryJS))
            entryCSS = resolve(join(sourceFolder, bundleFolder, moduleObj.path, entryCSS))
            let entryHTML = Array.isArray(moduleObj.html) ? moduleObj.html : [moduleObj.html]
            entryHTML = entryHTML.map(function(v) {
                return pagePath ? resolve(pagePath, v) : resolve(sourceFolder, bundleFolder, moduleObj.path, v)
            })
            _modules[moduleName] = {
                ...moduleObj,
                entryJS,
                entryCSS,
                html: entryHTML
            }
            if (isIsomorphic) {
                let bundleEntry = moduleObj.bundleEntry || (moduleName + '-server' + entryJSExt)
                bundleEntry = resolve(sourceFolder, bundleFolder, moduleObj.path, bundleEntry)
                _modules[moduleName].bundleEntry = bundleEntry
            }
        }
    }

    return {
        ...(omit(context, ['modules', 'proj'])),
        modules: _modules,
        ..._proj
    }
}