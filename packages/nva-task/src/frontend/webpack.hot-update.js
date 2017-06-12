import { DllReferencePlugin } from 'webpack'
import { join, resolve, sep } from 'path'
import { forEach, isPlainObject } from 'lodash'
import InjectHtmlPlugin from 'inject-html-webpack-plugin'
import FriendlyErrorsPlugin from 'friendly-errors-webpack-plugin'
import { config as configFactory } from 'nva-core'

export default function(context, constants, profile) {
    const { vendors, mods, sourceFolder, vendorFolder, vendorSourceMap, hmrPath } = context
    /** build variables*/
    let entry = {};
    let htmls = [];
    let baseConfig = configFactory({ ...constants, HOT: true }, profile)

    /*build vendors*/
    let dllRefs = []
    let sourcemapPath = join(constants.VENDOR_OUTPUT, vendorSourceMap)
    let sourcemap = require(sourcemapPath)
    if (isPlainObject(vendors.js)) {
        for (let key in vendors['js']) {
            let manifestPath = join(constants.VENDOR_OUTPUT, key + '-manifest.json')
            let _manifest = require(manifestPath)
            dllRefs.push(new DllReferencePlugin({
                context: __dirname,
                manifest: _manifest,
            }))
        }
    }

    /** build modules */
    forEach(mods, (mod, name) => {
        entry[name] = [
            "webpack-hot-middleware/client",
            mod.input.js,
            mod.input.css
        ];
        let _chunks = [name]
        let _more = { js: [], css: [] }
        if (mod.vendor) {
            if (mod.vendor.js && sourcemap.js && sourcemap.js[mod.vendor.js]) {
                _more.js = [join(sep, vendorFolder, sourcemap.js[mod.vendor.js])]
            }
            if (mod.vendor.css && sourcemap.css && sourcemap.css[mod.vendor.css]) {
                _more.css = [join(sep, vendorFolder, sourcemap.css[mod.vendor.css])]
            }
        }
        htmls.push(new InjectHtmlPlugin({
            processor: hmrPath,
            chunks: _chunks,
            filename: mod.input.html,
            more: _more
        }))
    })

    return {
        ...baseConfig,
        entry,
        profile,
        output: {
            path: constants.OUTPUT_PATH,
            filename: join("[name]", "[name].js"),
            chunkFilename: join("[name]", "[id].chunk.js"),
            publicPath: hmrPath
        },
        context: __dirname,
        resolveLoader: {
            modules: ['node_modules', resolve("node_modules")]
        },
        resolve: { modules: [sourceFolder, resolve("node_modules"), "node_modules"] },
        plugins: [
            ...baseConfig.plugins,
            ...dllRefs,
            ...htmls,
            new FriendlyErrorsPlugin({ clearConsole: false })
        ]
    }
}