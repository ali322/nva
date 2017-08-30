import webpack from 'webpack'
import { join, resolve, sep, extname } from 'path'
import { forEach, isPlainObject } from 'lodash'
import InjectHtmlPlugin from 'inject-html-webpack-plugin'
import ProgressBarPlugin from 'progress-bar-webpack-plugin'
import ChunkTransformPlugin from 'chunk-transform-webpack-plugin'
import chalk from 'chalk'
import { bundleTime } from '../lib/helper'
import { config as configFactory } from 'nva-core'

export default function(context, constants, profile) {
    let { vendors, mods, sourceFolder, chunkFolder, vendorFolder, vendorSourceMap } = context
    const { VENDOR_OUTPUT, OUTPUT_PATH } = constants
    /** build variables*/
    let entry = {}
    let htmls = []
    let transforms = []
    let baseConfig = configFactory({ ...constants, HOT: false }, profile)

    /** add vendors reference*/
    let dllRefs = []

    let sourcemapPath = resolve(VENDOR_OUTPUT, vendorSourceMap)
    let sourcemap = require(sourcemapPath).output
    if (isPlainObject(vendors.js)) {
        for (let key in vendors['js']) {
            let manifestPath = resolve(VENDOR_OUTPUT, key + '-manifest.json')
            let manifest = require(manifestPath)
            dllRefs.push(new webpack.DllReferencePlugin({
                context: resolve(sourceFolder),
                manifest,
            }))
        }
    }

    /** build modules*/
    forEach(mods, (mod, name) => {
        entry[name] = [mod.input.js].concat(mod.input.css ? [mod.input.css] : [])
        let chunks = [name]

        transforms.push(new ChunkTransformPlugin({
            chunks: [name],
            test: /\.(js|css)$/,
            filename: file => extname(file) === '.js' ? (mod.output.js || file) : (mod.output.css || file)
        }))

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
            transducer: sep,
            chunks,
            filename: mod.input.html,
            more,
            customInject: [{
                start: '<!-- start:bundle-time -->',
                end: '<!-- end:bundle-time -->',
                content: `<meta name="bundleTime" content="${bundleTime()}"/>`
            }, {
                start: '<!-- start:browser-sync -->',
                end: '<!-- end:browser-sync -->',
                content: ''
            }]
        }))
    })


    return {
        ...baseConfig,
        entry,
        output: {
            path: OUTPUT_PATH,
            filename: join("[name]", "[name]-[hash:8].js"),
            chunkFilename: join(chunkFolder, "[id]-[hash:8].chunk.js")
        },
        // context: __dirname,
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
            ...transforms,
            ...dllRefs,
            ...htmls
        ]
    }

}