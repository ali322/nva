import webpack from 'webpack'
import { join, resolve, sep } from 'path'
import InjectHtmlPlugin from 'inject-html-webpack-plugin'
import ProgressBarPlugin from 'progress-bar-webpack-plugin'
import FriendlyErrorsPlugin from 'friendly-errors-webpack-plugin'
import chalk from 'chalk'
import { config as configFactory } from '../../../nva-core/src'
import { checkManifest, serverHost } from '../lib'

export default function(context, constants) {
    const { vendors, modules, sourceFolder, distFolder, vendorFolder, hmrPath, port } = context
    /** build variables*/
    let entry = {};
    let htmls = [];
    let devServerHost = serverHost(port)
    let baseConfig = configFactory({ ...constants, HOT: true })

    /** add vendors reference*/
    let dllRefs = []
    let vendorManifestPath = join(constants.VENDOR_OUTPUT, 'vendor-manifest.json')
    checkManifest(vendorManifestPath)
    let vendorManifest = require(vendorManifestPath)
    for (let key in vendors['js']) {
        let manifestPath = join(constants.VENDOR_OUTPUT, key + '-manifest.json')
        checkManifest(manifestPath)
        let _manifest = require(manifestPath)
        dllRefs.push(new webpack.DllReferencePlugin({
            context: resolve(sourceFolder),
            manifest: _manifest
        }))
    }

    for (let moduleName in modules) {
        let moduleObj = modules[moduleName]
        let _moduleEntry = [
            'webpack-hot-middleware/client' + '?path=' + devServerHost + '/__webpack_hmr',
            // require.resolve("webpack/hot/only-dev-server"),
            moduleObj.entryJS,
            moduleObj.entryCSS
        ];
        entry[moduleName] = _moduleEntry
        let _chunks = [moduleName]
        let _more = { js: [], css: [] }
        if (moduleObj.vendor) {
            if (moduleObj.vendor.js) {
                _more.js = [join(sep, distFolder, vendorFolder, vendorManifest[moduleObj.vendor.js])]
            }
            if (moduleObj.vendor.css) {
                _more.css = [join(sep, distFolder, vendorFolder, vendorManifest[moduleObj.vendor.css])]
            }
        }
        moduleObj.html.forEach(function(html) {
            htmls.push(new InjectHtmlPlugin({
                processor: devServerHost + hmrPath,
                chunks: _chunks,
                filename: html,
                more: _more,
                customInject: [{
                    start: '<!-- start:browser-sync -->',
                    end: '<!-- end:browser-sync -->',
                    content: '<script src="' + devServerHost + '/bs/browser-sync-client.js"></script>'
                }]
            }))
        })
    }

    return {
        ...baseConfig,
        entry,
        output: {
            path: constants.OUTPUT_PATH,
            filename: "[name].js",
            chunkFilename: "[id].chunk.js",
            publicPath: devServerHost + hmrPath
        },
        context: __dirname,
        resolveLoader: {
            modules: [resolve("node_modules"), "node_modules"]
        },
        resolve: { modules: [sourceFolder, resolve("node_modules"), 'node_modules'] },
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