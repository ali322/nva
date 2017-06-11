import webpack from 'webpack'
import { join, resolve, sep } from 'path'
import { forEach, isPlainObject } from 'lodash'
import InjectHtmlPlugin from 'inject-html-webpack-plugin'
import ProgressBarPlugin from 'progress-bar-webpack-plugin'
import FriendlyErrorsPlugin from 'friendly-errors-webpack-plugin'
import chalk from 'chalk'
import { config as configFactory } from 'nva-core'
import { serverHost } from '../lib'

export default function(context, constants) {
    const { vendors, mods, sourceFolder, distFolder, vendorFolder, vendorSourceMap, hmrPath, port } = context
    /** build variables*/
    let entry = {};
    let htmls = [];
    let devServerHost = serverHost(port)
    let baseConfig = configFactory({ ...constants, HOT: true })

    /** add vendors reference*/
    let dllRefs = []
    let sourcemapPath = join(constants.VENDOR_OUTPUT, vendorSourceMap)
    let sourcemap = require(sourcemapPath)
    if (isPlainObject(vendors.js)) {
        for (let key in vendors['js']) {
            let manifestPath = join(constants.VENDOR_OUTPUT, key + '-manifest.json')
            let _manifest = require(manifestPath)
            dllRefs.push(new webpack.DllReferencePlugin({
                context: resolve(sourceFolder),
                manifest: _manifest
            }))
        }
    }

    /** build modules */
    forEach(mods, (mod, name) => {
        entry[name] = [
            require.resolve('webpack-hot-middleware/client') + '?path=' + devServerHost + '/__webpack_hmr',
            // require.resolve("webpack/hot/only-dev-server"),
            mod.input.js,
            mod.input.css
        ]
        let _chunks = [name]

        let _more = { js: [], css: [] }
        if (mod.vendor) {
            if (mod.vendor.js && sourcemap.js && sourcemap.js[mod.vendor.js]) {
                _more.js = [join(sep, distFolder, vendorFolder, sourcemap.js[mod.vendor.js])]
            }
            if (mod.vendor.css && sourcemap.css && sourcemap.css[mod.vendor.css]) {
                _more.css = [join(sep, distFolder, vendorFolder, sourcemap.css[mod.vendor.css])]
            }
        }
        htmls.push(new InjectHtmlPlugin({
            processor: devServerHost + hmrPath,
            chunks: _chunks,
            filename: mod.input.html,
            more: _more,
            customInject: [{
                start: '<!-- start:browser-sync -->',
                end: '<!-- end:browser-sync -->',
                content: '<script src="' + devServerHost + '/bs/browser-sync-client.js"></script>'
            }]
        }))
    })

    return {
        ...baseConfig,
        entry,
        output: {
            path: constants.OUTPUT_PATH,
            filename: "[name].js",
            chunkFilename: "[id].chunk.js",
            publicPath: devServerHost + hmrPath
        },
        // context: __dirname,
        // resolveLoader: {
        //     modules: [resolve("node_modules"), "node_modules"]
        // },
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