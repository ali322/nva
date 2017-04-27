import webpack from 'webpack'
import path from 'path'
import InjectHtmlPlugin from 'inject-html-webpack-plugin'
import ProgressBarPlugin from 'progress-bar-webpack-plugin'
import FriendlyErrorsPlugin from 'friendly-errors-webpack-plugin'
import chalk from 'chalk'
import { config as configFactory } from 'nva-core'
import { checkManifest } from '../lib'

export default function(env, constants) {
    /** build variables*/
    let entry = {};
    let htmls = [];
    let HMR_PATH = env.reloaderHost + env.hmrPath
    let RELOADER_HOST = env.reloaderHost
    let baseConfig = configFactory({ ...constants, HOT: true })

    /** add vendors reference*/
    let dllRefs = []
    let vendorManifestPath = path.join(constants.VENDOR_OUTPUT, 'vendor-manifest.json')
    checkManifest(vendorManifestPath)
    let vendorManifest = require(vendorManifestPath)
    for (let key in env.vendors['js']) {
        let manifestPath = path.join(constants.VENDOR_OUTPUT, key + '-manifest.json')
        checkManifest(manifestPath)
        let _manifest = require(manifestPath)
        dllRefs.push(new webpack.DllReferencePlugin({
            context: path.resolve(env.clientPath),
            manifest: _manifest
        }))
    }

    env.modules.forEach(function(moduleObj) {
        let _moduleEntry = [
            'webpack-hot-middleware/client' + '?path=' + env.reloaderHost + '/__webpack_hmr',
            // require.resolve("webpack/hot/only-dev-server"),
            moduleObj.entryJS,
            moduleObj.entryCSS
        ];
        let _chunks = [moduleObj.name]
        let _more = { js: [], css: [] }
        if (moduleObj.vendor) {
            if (moduleObj.vendor.js) {
                _more.js = [path.join(path.sep, env.distFolder, env.vendorFolder, vendorManifest[moduleObj.vendor.js])]
            }
            if (moduleObj.vendor.css) {
                _more.css = [path.join(path.sep, env.distFolder, env.vendorFolder, vendorManifest[moduleObj.vendor.css])]
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
        resolveLoader: {
            modules: [path.join(process.cwd(), "node_modules"), "node_modules"]
        },
        resolve: { modules: [env.sourcePath, path.join(process.cwd(), "node_modules"),'node_modules'] },
        plugins: [
            ...baseConfig.plugins.slice(1),
            new ProgressBarPlugin({
                format: 'Building client [:bar] ' + chalk.green.bold(':percent'),
                clear: false,
                summary: false
            }),
            new FriendlyErrorsPlugin({ clearConsole: false }),
            ...dllRefs,
            ...htmls
        ]
    }

}