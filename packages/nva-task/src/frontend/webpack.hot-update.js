import webpack from 'webpack'
import path from 'path'
import glob from 'glob'
import InjectHtmlPlugin from 'inject-html-webpack-plugin'
import { config as configFactory } from 'nva-core'
import { checkManifest } from '../lib/helper'

export default function(env, constants) {
    /** build variables*/
    let entry = {};
    let htmls = [];
    let RELOADER_HOST = env.reloaderHost
    let baseConfig = configFactory({ ...constants, HOT: true })

    /*build vendors*/
    let dllRefs = []
    let vendors = []
    vendors = glob.sync('*.{js,css}', {
        cwd: path.join(process.cwd(), env.distFolder, env.vendorFolder)
    })
    for (let key in env.vendors['js']) {
        let manifestPath = path.join(process.cwd(), env.distFolder, env.vendorFolder, key + '-manifest.json')
        checkManifest(manifestPath)
        let _manifest = require(manifestPath)
        dllRefs.push(new webpack.DllReferencePlugin({
            context: __dirname,
            manifest: _manifest,
        }))
    }

    /** build modules */
    env.modules.forEach(function(moduleObj) {
        entry[moduleObj.name] = [
            "webpack-hot-middleware/client",
            moduleObj.entryJS,
            moduleObj.entryCSS
        ];
        let _chunks = [moduleObj.name]
        let _more = { js: [], css: [] }
        if (moduleObj.vendor) {
            if (moduleObj.vendor.js) {
                _more.js = vendors.filter(function(v) {
                    let _regexpJS = new RegExp(moduleObj.vendor.js + "-\\w+\\.js$")
                    return _regexpJS.test(v)
                }).map(function(v) {
                    return path.join(env.vendorFolder, v)
                })
                _more.css = vendors.filter(function(v) {
                    let _regexpCSS = new RegExp(moduleObj.vendor.css + "-\\w+\\.css$")
                    return _regexpCSS.test(v)
                }).map(function(v) {
                    return path.join(env.vendorFolder, v)
                })
            }
        }
        moduleObj.html.forEach(function(html) {
            htmls.push(new InjectHtmlPlugin({
                processor: env.hmrPath,
                chunks: _chunks,
                filename: html,
                more: _more,
                customInject: [{
                    start: '<!-- start:browser-sync -->',
                    end: '<!-- end:browser-sync -->',
                    content: '<script src="' + RELOADER_HOST + '/bs/browser-sync-client.js"></script>'
                }]
            }))
        })
    })

    return {
        ...baseConfig,
        entry,
        // profile: true,
        output: {
            path: constants.OUTPUT_PATH,
            filename: path.join("[name]", "[name].js"),
            chunkFilename: path.join("[name]", "[id].chunk.js"),
            publicPath: env.hmrPath
        },
        context: __dirname,
        resolve: { modules: [env.sourcePath, path.join(process.cwd(), "node_modules"), "node_modules"] },
        plugins: [
            ...baseConfig.plugins,
            ...dllRefs,
            ...htmls
        ]
    }
}