import webpack from 'webpack'
import path from 'path'
import InjectHtmlPlugin from 'inject-html-webpack-plugin'
import { config as configFactory } from 'nva-core'
import { bundleTime, checkManifest } from '../lib/helper'
import { relativeURL } from '../lib/'

export default function(env, constants) {
    /** build variables*/
    let entry = {}
    let htmls = []
    let baseConfig = configFactory({ ...constants, HOT: false })

    /** build vendors*/
    let dllRefs = []
    let vendorManifestPath = path.join(constants.VENDOR_OUTPUT, 'vendor-manifest.json')
    checkManifest(vendorManifestPath)
    let vendorManifest = require(vendorManifestPath)
    for (let key in env.vendors['js']) {
        let manifestPath = path.join(constants.VENDOR_OUTPUT, key + '-manifest.json')
        checkManifest(manifestPath)
        let _manifest = require(manifestPath)
        dllRefs.push(new webpack.DllReferencePlugin({
            context: __dirname,
            manifest: _manifest,
        }))
    }

    env.modules.forEach(function(moduleObj) {
        entry[moduleObj.name] = [moduleObj.entryJS, moduleObj.entryCSS]
        let _chunks = [moduleObj.name]
        let _more = { js: [], css: [] }
        const htmlOutput = moduleObj.htmlOutput || path.join(env.distFolder, moduleObj.name)
        if (moduleObj.vendor) {
            if (moduleObj.vendor.js) {
                let originalURL = path.join(env.distFolder, env.vendorFolder, vendorManifest[moduleObj.vendor.js])
                _more.js = [relativeURL(htmlOutput, originalURL)]
            }
            if (moduleObj.vendor.css) {
                let originalURL = path.join(env.distFolder, env.vendorFolder, vendorManifest[moduleObj.vendor.css])
                _more.css = [relativeURL(htmlOutput, originalURL)]
            }
        }
        moduleObj.html.forEach(function(html) {
            const output = path.join(htmlOutput, path.basename(html))
            htmls.push(new InjectHtmlPlugin({
                processor: function(_url) {
                    return relativeURL(htmlOutput, _url)
                },
                more: _more,
                chunks: _chunks,
                filename: html,
                output,
                customInject: [{
                    start: '<!-- start:bundle-time -->',
                    end: '<!-- end:bundle-time -->',
                    content: bundleTime()
                }, {
                    start: '<!-- start:browser-sync -->',
                    end: '<!-- end:browser-sync -->',
                    content: ''
                }]
            }))
        })
    })

    return {
        ...baseConfig,
        entry,
        output: {
            path: constants.OUTPUT_PATH,
            filename: path.join(env.distFolder, "[name]", "[name]-[hash:8].js"),
            chunkFilename: path.join(env.distFolder, "[name]", "[id]-[hash:8].chunk.js")
        },
        context: __dirname,
        resolve: { modules: [env.sourcePath, path.join(process.cwd(), "node_modules")] },
        plugins: [
            ...baseConfig.plugins,
            ...dllRefs,
            ...htmls
        ]
    }
}