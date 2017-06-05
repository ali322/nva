import webpack from 'webpack'
import { join, resolve, sep, extname } from 'path'
import { forEach } from 'lodash'
import InjectHtmlPlugin from 'inject-html-webpack-plugin'
import ProgressBarPlugin from 'progress-bar-webpack-plugin'
import ChunkTransformPlugin from 'chunk-transform-webpack-plugin'
import chalk from 'chalk'
import { bundleTime } from '../lib/helper'
import { config as configFactory } from 'nva-core'

export default function(context, constants, profile) {
    let { vendors, mods, sourceFolder, distFolder, vendorFolder, vendorSourceMap } = context
    /** build variables*/
    let entry = {}
    let htmls = []
    let transforms = []
    let baseConfig = configFactory({ ...constants, HOT: false }, profile)

    /** add vendors reference*/
    let dllRefs = []

    let vendorManifestPath = join(constants.VENDOR_OUTPUT, vendorSourceMap)
    let vendorManifest = require(vendorManifestPath)
    for (let key in vendors['js']) {
        let manifestPath = join(constants.VENDOR_OUTPUT, key + '-manifest.json')
        let _manifest = require(manifestPath)
        dllRefs.push(new webpack.DllReferencePlugin({
            context: resolve(sourceFolder),
            manifest: _manifest,
        }))
    }

    /** build modules*/
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
        if (mod.vendor) {
            if (mod.vendor.js) {
                _more.js = [join(sep, distFolder, vendorFolder, vendorManifest.js[mod.vendor.js])]
            }
            if (mod.vendor.css) {
                _more.css = [join(sep, distFolder, vendorFolder, vendorManifest.css[mod.vendor.css])]
            }
        }
        htmls.push(new InjectHtmlPlugin({
            processor: sep,
            chunks: _chunks,
            filename: mod.input.html,
            more: _more,
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