import { DllReferencePlugin } from 'webpack'
import { join, resolve, dirname, extname } from 'path'
import InjectHtmlPlugin from 'inject-html-webpack-plugin'
import ChunkTransformPlugin from 'chunk-transform-webpack-plugin'
import { config as configFactory } from 'nva-core'
import { relativeURL, bundleTime } from '../lib/helper'

export default function(context, constants, profile) {
    const { vendors, modules, sourceFolder, distFolder, vendorFolder, vendorSourceMap } = context
    /** build variables*/
    let entry = {}
    let htmls = []
    let transforms = []
    let baseConfig = configFactory({ ...constants, HOT: false }, profile)

    /** build vendors*/
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
        entry[moduleName] = [moduleObj.input.js, moduleObj.input.css]
        let _chunks = [moduleName]

        if (moduleObj.output.js || moduleObj.output.css) {
            transforms.push(new ChunkTransformPlugin({
                chunks: [moduleName],
                test: /\.(js|css)$/,
                filename: filename => extname(filename) === '.js' ? moduleObj.output.js : moduleObj.output.css
            }))
        }

        let _more = { js: [], css: [] }
        const htmlOutput = moduleObj.output.html || join(distFolder, moduleName, moduleObj.input.html)
        if (moduleObj.vendor) {
            if (moduleObj.vendor.js) {
                let originalURL = join(distFolder, vendorFolder, vendorManifest.js[moduleObj.vendor.js])
                _more.js = [relativeURL(dirname(htmlOutput), originalURL)]
            }
            if (moduleObj.vendor.css) {
                let originalURL = join(distFolder, vendorFolder, vendorManifest.css[moduleObj.vendor.css])
                _more.css = [relativeURL(dirname(htmlOutput), originalURL)]
            }
        }
        htmls.push(new InjectHtmlPlugin({
            processor: function(_url) {
                return relativeURL(dirname(htmlOutput), _url)
            },
            more: _more,
            chunks: _chunks,
            filename: moduleObj.input.html,
            output: htmlOutput,
            customInject: [{
                start: '<!-- start:bundle-time -->',
                end: '<!-- end:bundle-time -->',
                content: `<meta name="bundleTime" content="${bundleTime()}"/>`
            }]
        }))

    }

    return {
        ...baseConfig,
        entry,
        output: {
            path: constants.OUTPUT_PATH,
            filename: join(distFolder, "[name]", "[name]-[hash:8].js"),
            chunkFilename: join(distFolder, "[name]", "[id]-[hash:8].chunk.js")
        },
        context: __dirname,
        resolveLoader: {
            modules: [resolve("node_modules"), "node_modules"]
        },
        resolve: { modules: [sourceFolder, resolve("node_modules"), 'node_modules'] },
        plugins: [
            ...baseConfig.plugins,
            ...transforms,
            ...dllRefs,
            ...htmls
        ]
    }
}