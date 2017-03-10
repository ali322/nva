import webpack from 'webpack'
import path from 'path'
import glob from 'glob'
import InjectHtmlPlugin from 'inject-html-webpack-plugin'
import {config as configFactory} from 'nva-core'
import {checkManifest} from '../lib/helper'

export default function(env, constants) {
    /** build variables*/
    let entry = {};
    let htmls = [];
    let HMR_PATH = env.reloaderHost + env.hmrPath
    let RELOADER_HOST = env.reloaderHost
    let baseConfig = configFactory({ ...constants, HOT: true })

    /** add vendors reference*/
    let dllRefs = []
    let vendors = []
    vendors = glob.sync('*.{js,css}', {
        cwd: path.join(process.cwd(), env.clientPath, env.distFolder, env.vendorFolder)
    })
    for (let key in env.vendors['js']) {
        let manifestPath = path.join(process.cwd(), env.clientPath, env.distFolder, env.vendorFolder, key + '-manifest.json')
        checkManifest(manifestPath)
        let _manifest = require(manifestPath)
        dllRefs.push(new webpack.DllReferencePlugin({
            context: path.resolve(env.clientPath),
            manifest: _manifest
        }))
    }

    env.modules.forEach(function(moduleObj) {
        let _moduleEntry = [
            require.resolve('webpack-hot-middleware/client') + '?path=' + env.reloaderHost + '/__webpack_hmr',
            // require.resolve("webpack/hot/only-dev-server"),
            moduleObj.entryJS,
            moduleObj.entryCSS
        ];
        let _chunks = [moduleObj.name]
        let _more = { js: [], css: [] }
        if (moduleObj.vendor) {
            if (moduleObj.vendor.js) {
                _more.js = vendors.filter(function(v) {
                    var _regexp = new RegExp(moduleObj.vendor.js + "-\\w+\\.js$")
                    return _regexp.test(v)
                }).map(function(v) {
                    return path.join(path.sep, env.distFolder, env.vendorFolder, v)
                })
                _more.css = vendors.filter(function(v) {
                    var _regexp = new RegExp(moduleObj.vendor.css + "-\\w+\\.css$")
                    return _regexp.test(v)
                }).map(function(v) {
                    return path.join(path.sep, env.distFolder, env.vendorFolder, v)
                })
            }
        }
        moduleObj.html.forEach(function(html) {
            htmls.push(new InjectHtmlPlugin({
                processor: HMR_PATH,
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
        entry[moduleObj.name] = _moduleEntry
    });


    return {
        ...baseConfig,
        entry,
        output: {
            path: constants.OUTPUT_PATH,
            filename: "[name].js",
            chunkFilename: "[id].chunk.js",
            publicPath: HMR_PATH
        },
        context: __dirname,
        resolve: { modules: [env.clientPath, path.join(process.cwd(), "node_modules"), "node_modules"] },
        plugins: [
            ...baseConfig.plugins,
            ...dllRefs,
            ...htmls
        ]
    }

}