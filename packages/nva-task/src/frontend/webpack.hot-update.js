import { DllReferencePlugin } from 'webpack'
import { join, resolve, sep } from 'path'
import InjectHtmlPlugin from 'inject-html-webpack-plugin'
import FriendlyErrorsPlugin from 'friendly-errors-webpack-plugin'
import { config as configFactory } from 'nva-core'

export default function(context, constants) {
    const { vendors, modules, sourceFolder, vendorFolder, vendorSourceMap, hmrPath } = context
    /** build variables*/
    let entry = {};
    let htmls = [];
    let baseConfig = configFactory({ ...constants, HOT: true })

    /*build vendors*/
    let dllRefs = []
    let vendorManifestPath = join(constants.VENDOR_OUTPUT, vendorSourceMap)
    let vendorManifest = require(vendorManifestPath)
    for (let key in vendors['js']) {
        let manifestPath = join(constants.VENDOR_OUTPUT, key + '-manifest.json')
        let _manifest = require(manifestPath)
        dllRefs.push(new DllReferencePlugin({
            context: __dirname,
            manifest: _manifest,
        }))
    }

    /** build modules */
    for (let moduleName in modules) {
        let moduleObj = modules[moduleName]
        entry[moduleName] = [
            "webpack-hot-middleware/client",
            moduleObj.entryJS,
            moduleObj.entryCSS
        ];
        let _chunks = [moduleName]
        let _more = { js: [], css: [] }
        if (moduleObj.vendor) {
            if (moduleObj.vendor.js) {
                _more.js = [join(sep, vendorFolder, vendorManifest.js[moduleObj.vendor.js])]
            }
            if (moduleObj.vendor.css) {
                _more.css = [join(sep, vendorFolder, vendorManifest.css[moduleObj.vendor.css])]
            }
        }
        moduleObj.html.forEach(function(html) {
            htmls.push(new InjectHtmlPlugin({
                processor: hmrPath,
                chunks: _chunks,
                filename: html,
                more: _more
            }))
        })
    }

    return {
        ...baseConfig,
        entry,
        // profile: true,
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