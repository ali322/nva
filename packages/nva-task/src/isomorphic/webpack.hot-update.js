import webpack from 'webpack'
import { join, resolve, sep } from 'path'
import { forEach, isPlainObject } from 'lodash'
import InjectHtmlPlugin from 'inject-html-webpack-plugin'
import ProgressBarPlugin from 'progress-bar-webpack-plugin'
import FriendlyErrorsPlugin from 'friendly-errors-webpack-plugin'
import chalk from 'chalk'
import { config as configFactory } from 'nva-core'
import { serverHost } from '../lib'

export default function(context, constants, profile) {
    const { vendors, mods, sourceFolder, vendorFolder, vendorSourceMap, hmrPath, port } = context
    const { VENDOR_OUTPUT, OUTPUT_PATH } = constants
    /** build variables*/
    let entry = {};
    let htmls = [];
    let devServerHost = serverHost(port)
    let baseConfig = configFactory({ ...constants, HOT: true }, profile)

    /** add vendors reference*/
    let dllRefs = []
    let sourcemapPath = resolve(VENDOR_OUTPUT, vendorSourceMap)
    let sourcemap = require(sourcemapPath)
    if (isPlainObject(vendors.js)) {
        for (let key in vendors['js']) {
            let manifestPath = resolve(VENDOR_OUTPUT, key + '-manifest.json')
            let manifest = require(manifestPath)
            dllRefs.push(new webpack.DllReferencePlugin({
                context: resolve(sourceFolder),
                manifest
            }))
        }
    }

    /** build modules */
    forEach(mods, (mod, name) => {
        entry[name] = [
            'webpack-hot-middleware/client' + '?path=' + devServerHost + '/__webpack_hmr',
            mod.input.js
        ].concat(mod.input.css ? [mod.input.css] : [])
        let chunks = [name]

        let more = { js: [], css: [] }
        if (mod.vendor) {
            if (mod.vendor.js && sourcemap.js && sourcemap.js[mod.vendor.js]) {
                more.js = [join(sep, vendorFolder, sourcemap.js[mod.vendor.js])]
            }
            if (mod.vendor.css && sourcemap.css && sourcemap.css[mod.vendor.css]) {
                more.css = [join(sep, vendorFolder, sourcemap.css[mod.vendor.css])]
            }
        }
        htmls.push(new InjectHtmlPlugin({
            processor: devServerHost + hmrPath,
            chunks,
            filename: mod.input.html,
            more,
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
            path: OUTPUT_PATH,
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