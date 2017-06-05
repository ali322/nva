import { omit, mapValues } from 'lodash'
import { join } from 'path'
import { initMod } from './mod'

export default function(context) {
    const { proj, mods, conf } = context
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
        vendorSourceMap: 'sourcemap.json',

        assetFolder: 'asset',
        fontFolder: 'font',
        imageFolder: 'image',
        fontPrefix: '',
        imagePrefix: '',

        hmrPath: "/hmr/",
        cachePath: join(conf.rootPath, 'temp', 'happypack')
    }

    if (isIsomorphic) {
        _proj = {
            ..._proj,
            moduleFolder: 'module',
            serverFolder: 'server',
            serverEntry: 'bootstrap.js',
            viewFolder: 'view',
            sourceFolder: "client",
        }
    }

    _proj = { ..._proj, ...proj }

    let _mods = mapValues(mods, (mod, name) => {
        return {
            ...mod,
            ...(initMod(mod, name, _proj))
        }
    })

    return {
        ...(omit(context, ['mods', 'proj'])),
        mods: _mods,
        ..._proj
    }
}