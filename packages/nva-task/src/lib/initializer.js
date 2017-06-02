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
            pagePath: 'view',
            cssFolder: 'stylesheet',
            moduleFolder: 'module',
            serverFolder: 'server',
            serverEntry: 'bootstrap.js',
            sourceFolder: "client",
        }
    }

    _proj = { ..._proj, ...proj }

    const { pagePath, sourceFolder, bundleFolder, jsExt, cssExt, htmlExt } = _proj

    let _modules = {}
    if (modules) {
        for (let moduleName in modules) {
            let moduleObj = modules[moduleName]

            // input
            let input = moduleObj.input || {}
            input.js = input.js || join(moduleName, moduleName + jsExt)
            input.css = input.css || join(moduleName, moduleName + cssExt)
            input.html = input.html || join(moduleName, moduleName + htmlExt)
            input.js = resolve(join(sourceFolder, bundleFolder, input.js))
            input.css = resolve(join(sourceFolder, bundleFolder, input.css))
            input.html = pagePath ? resolve(pagePath, input.html) : resolve(sourceFolder, bundleFolder, input.html)

            //output
            let output = moduleObj.output || {}

            _modules[moduleName] = {
                ...moduleObj,
                input,
                output
            }
        }
    }

    return {
        ...(omit(context, ['modules', 'proj'])),
        modules: _modules,
        ..._proj
    }
}