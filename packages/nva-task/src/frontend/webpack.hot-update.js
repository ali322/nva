import { DllReferencePlugin } from 'webpack'
import { join, resolve, sep } from 'path'
import { forEach, isPlainObject } from 'lodash'
import InjectHtmlPlugin from 'inject-html-webpack-plugin'
import FriendlyErrorsPlugin from 'friendly-errors-webpack-plugin'
import ProgressPlugin from '../lib/progress'
import { config as configFactory } from 'nva-core'

export default function(context, constants, profile) {
    const { vendors, mods, sourceFolder, vendorFolder, chunkFolder, vendorSourceMap, hmrPath } = context
    const { VENDOR_OUTPUT, OUTPUT_PATH } = constants
    /** build variables*/
    let entry = {};
    let htmls = [];
    let baseConfig = configFactory({ ...constants, HOT: true }, profile)

    /*build vendors*/
    let dllRefs = []
    let sourcemapPath = resolve(VENDOR_OUTPUT, vendorSourceMap)
    let sourcemap = require(sourcemapPath).output
    if (isPlainObject(vendors.js)) {
        for (let key in vendors['js']) {
            let manifestPath = resolve(VENDOR_OUTPUT, key + '-manifest.json')
            let manifest = require(manifestPath)
            dllRefs.push(new DllReferencePlugin({
                context: __dirname,
                manifest,
            }))
        }
    }

    /** build modules */
    forEach(mods, (mod, name) => {
        entry[name] = [
            require.resolve("webpack-hot-middleware/client"),
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
            transducer: hmrPath,
            chunks,
            filename: mod.input.html,
            more
        }))
    })

    return {
        ...baseConfig,
        entry,
        profile,
        output: {
            path: OUTPUT_PATH,
            filename: join("[name]", "[name].js"),
            chunkFilename: join(chunkFolder, "[id].chunk.js"),
            publicPath: hmrPath
        },
        bail: true,
        // context: __dirname,
        resolveLoader: {
            modules: ['node_modules', resolve("node_modules")]
        },
        resolve: { modules: [sourceFolder, resolve("node_modules"), "node_modules"] },
        plugins: [
            ...baseConfig.plugins,
            ...dllRefs,
            ...htmls,
            new ProgressPlugin(true, { onProgress: context.onDevProgress }),
            new FriendlyErrorsPlugin({ clearConsole: false, errorsOnly: true })
        ]
    }
}