import { DllReferencePlugin } from 'webpack'
import { join, resolve, dirname, extname } from 'path'
import { forEach,isPlainObject } from 'lodash'
import InjectHtmlPlugin from 'inject-html-webpack-plugin'
import ChunkTransformPlugin from 'chunk-transform-webpack-plugin'
import { config as configFactory } from 'nva-core'
import { relativeURL, bundleTime } from '../lib/helper'

export default function(context, constants, profile) {
    const { vendors, mods, sourceFolder, distFolder, vendorFolder, vendorSourceMap } = context
    /** build variables*/
    let entry = {}
    let htmls = []
    let transforms = []
    let baseConfig = configFactory({ ...constants, HOT: false }, profile)

    /** build vendors*/
    let dllRefs = []
    let sourcemapPath = join(constants.VENDOR_OUTPUT, vendorSourceMap)
    let sourcemap = require(sourcemapPath)
    if(isPlainObject(vendors.js)){
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
        entry[name] = [mod.input.js, mod.input.css]
        let _chunks = [name]

        if (mod.output.js || mod.output.css) {
            transforms.push(new ChunkTransformPlugin({
                chunks: [name],
                test: /\.(js|css)$/,
                filename: filename => extname(filename) === '.js' ? mod.output.js : mod.output.css
            }))
        }

        let _more = { js: [], css: [] }
        const htmlOutput = mod.output.html || join(distFolder, name, `${name}.html`)
        if (mod.vendor) {
            if (mod.vendor.js && sourcemap.js && sourcemap.js[mod.vendor.js]) {
                let originalURL = join(distFolder, vendorFolder, sourcemap.js[mod.vendor.js])
                _more.js = [relativeURL(dirname(htmlOutput), originalURL)]
            }
            if (mod.vendor.css && sourcemap.css && sourcemap.css[mod.vendor.css]) {
                let originalURL = join(distFolder, vendorFolder, sourcemap.css[mod.vendor.css])
                _more.css = [relativeURL(dirname(htmlOutput), originalURL)]
            }
        }
        htmls.push(new InjectHtmlPlugin({
            processor: function(_url) {
                return relativeURL(dirname(htmlOutput), _url)
            },
            more: _more,
            chunks: _chunks,
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
            path: constants.OUTPUT_PATH,
            filename: join(distFolder, "[name]", "[name]-[hash:8].js"),
            chunkFilename: join(distFolder, "[name]", "[id]-[hash:8].chunk.js")
        },
        // context: __dirname,
        // resolveLoader: {
        //     modules: [resolve("node_modules"), "node_modules"]
        // },
        resolve: { modules: [sourceFolder, resolve("node_modules"), 'node_modules'] },
        plugins: [
            ...baseConfig.plugins,
            // ...transforms,
            ...dllRefs,
            ...htmls
        ]
    }
}