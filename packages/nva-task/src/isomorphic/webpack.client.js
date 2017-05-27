import webpack from 'webpack'
import { join, resolve, sep } from 'path'
import InjectHtmlPlugin from 'inject-html-webpack-plugin'
import ProgressBarPlugin from 'progress-bar-webpack-plugin'
import chalk from 'chalk'
import { bundleTime } from '../lib/helper'
import { config as configFactory } from 'nva-core'

export default function(context, constants, profile) {
    let { vendors, modules, sourceFolder, distFolder, vendorFolder, vendorSourceMap } = context
    /** build variables*/
    let entry = {};
    let htmls = [];
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
    for (let moduleName in modules) {
        let moduleObj = modules[moduleName]
        entry[moduleName] = [moduleObj.entryJS, moduleObj.entryCSS]
        let _chunks = [moduleName]
        let _more = { js: [], css: [] }
        if (moduleObj.vendor) {
            if (moduleObj.vendor.js) {
                _more.js = [join(sep, distFolder, vendorFolder, vendorManifest.js[moduleObj.vendor.js])]
            }
            if (moduleObj.vendor.css) {
                _more.css = [join(sep, distFolder, vendorFolder, vendorManifest.css[moduleObj.vendor.css])]
            }
        }
        moduleObj.html.forEach(function(html) {
            htmls.push(new InjectHtmlPlugin({
                processor: sep,
                chunks: _chunks,
                filename: html,
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
            ...baseConfig.plugins.slice(1),
            new ProgressBarPlugin({
                format: 'Building client [:bar] ' + chalk.green.bold(':percent'),
                clear: false,
                summary: false
            }),
            ...dllRefs,
            ...htmls
        ]
    }

}