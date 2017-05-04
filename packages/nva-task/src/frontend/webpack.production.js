import { DllReferencePlugin } from 'webpack'
import { join, basename, resolve } from 'path'
import InjectHtmlPlugin from 'inject-html-webpack-plugin'
import { config as configFactory } from '../../../nva-core/src'
import { checkManifest } from '../lib/'
import { relativeURL, bundleTime } from '../lib/helper'

export default function(context, constants, profile) {
    const { vendors, modules, sourceFolder, distFolder, vendorFolder } = context
    /** build variables*/
    let entry = {}
    let htmls = []
    let baseConfig = configFactory({ ...constants, HOT: false }, profile)

    /** build vendors*/
    let dllRefs = []
    let vendorManifestPath = join(constants.VENDOR_OUTPUT, 'vendor-manifest.json')
    checkManifest(vendorManifestPath)
    let vendorManifest = require(vendorManifestPath)
    for (let key in vendors['js']) {
        let manifestPath = join(constants.VENDOR_OUTPUT, key + '-manifest.json')
        checkManifest(manifestPath)
        let _manifest = require(manifestPath)
        dllRefs.push(new DllReferencePlugin({
            context: __dirname,
            manifest: _manifest,
        }))
    }

    /** build modules */
    for (let moduleName in modules) {
        let moduleObj = modules[moduleName]
        entry[moduleName] = [moduleObj.entryJS, moduleObj.entryCSS]
        let _chunks = [moduleName]
        let _more = { js: [], css: [] }
        const htmlOutput = moduleObj.htmlOutput || join(distFolder, moduleName)
        if (moduleObj.vendor) {
            if (moduleObj.vendor.js) {
                let originalURL = join(distFolder, vendorFolder, vendorManifest[moduleObj.vendor.js])
                _more.js = [relativeURL(htmlOutput, originalURL)]
            }
            if (moduleObj.vendor.css) {
                let originalURL = join(distFolder, vendorFolder, vendorManifest[moduleObj.vendor.css])
                _more.css = [relativeURL(htmlOutput, originalURL)]
            }
        }
        moduleObj.html.forEach(function(html) {
            const output = join(htmlOutput, basename(html))
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
            ...baseConfig.plugins,
            ...dllRefs,
            ...htmls
        ]
    }
}