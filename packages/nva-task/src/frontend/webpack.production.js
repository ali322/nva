import { DllReferencePlugin } from 'webpack'
import { join, resolve, dirname, extname } from 'path'
import { forEach, isPlainObject } from 'lodash'
import InjectHtmlPlugin from 'inject-html-webpack-plugin'
import ChunkTransformPlugin from 'chunk-transform-webpack-plugin'
import { config as configFactory } from 'nva-core'
import { relativeURL, bundleTime } from '../lib/helper'

export default function(context, constants, profile) {
    const { vendors, mods, sourceFolder, distFolder, vendorFolder, vendorSourceMap } = context
    const { VENDOR_OUTPUT, OUTPUT_PATH } = constants
    /** build variables*/
    let entry = {}
    let htmls = []
    let transforms = []
    let baseConfig = configFactory({ ...constants, HOT: false }, profile)

    /** build vendors*/
    let dllRefs = []
    let sourcemapPath = join(VENDOR_OUTPUT, vendorSourceMap)
    let sourcemap = require(sourcemapPath)
    if (isPlainObject(vendors.js)) {
        for (let key in vendors['js']) {
            let manifestPath = join(VENDOR_OUTPUT, key + '-manifest.json')
            let _manifest = require(manifestPath)
            dllRefs.push(new DllReferencePlugin({
                context: __dirname,
                manifest: _manifest,
            }))
        }
    }

    /** build modules */
    forEach(mods, (mod, name) => {
        entry[name] = [mod.input.js, mod.input.css]
        let chunks = [name]
        transforms.push(new ChunkTransformPlugin({
            chunks: [name],
            test: /\.(js|css)$/,
            filename: file => extname(file) === '.js' ? (mod.output.js || file) : (mod.output.css || file)
        }))

        let more = { js: [], css: [] }
        const htmlOutput = mod.output.html
        if (mod.vendor) {
            if (mod.vendor.js && sourcemap.js && sourcemap.js[mod.vendor.js]) {
                let originalURL = join(distFolder, vendorFolder, sourcemap.js[mod.vendor.js])
                more.js = [relativeURL(dirname(htmlOutput), originalURL)]
            }
            if (mod.vendor.css && sourcemap.css && sourcemap.css[mod.vendor.css]) {
                let originalURL = join(distFolder, vendorFolder, sourcemap.css[mod.vendor.css])
                more.css = [relativeURL(dirname(htmlOutput), originalURL)]
            }
        }
        htmls.push(new InjectHtmlPlugin({
            processor: function(url) {
                return relativeURL(dirname(htmlOutput), join(distFolder, url))
            },
            more,
            chunks,
            filename: mod.input.html,
            output: htmlOutput,
            customInject: [{
                start: '<!-- start:bundle-time -->',
                end: '<!-- end:bundle-time -->',
                content: `<meta name="bundleTime" content="${bundleTime()}"/>`
            }]
        }))
    })

    return {
        ...baseConfig,
        entry,
        output: {
            path: OUTPUT_PATH,
            filename: join("[name]", "[name]-[hash:8].js"),
            chunkFilename: join("[name]", "[id]-[hash:8].chunk.js")
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