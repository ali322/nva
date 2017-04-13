import webpack from 'webpack'
import path from 'path'
import glob from 'glob'
import InjectHtmlPlugin from 'inject-html-webpack-plugin'
import {config as configFactory} from 'nva-core'
import { bundleTime,checkManifest } from '../lib/helper'

export default function(env, constants) {
    /** build variables*/
    let entry = {}
    let htmls = []
    let baseConfig = configFactory({ ...constants, HOT: false })

    /** build vendors*/
    let dllRefs = []
    let vendors = []
    vendors = glob.sync('*.{js,css}', {
        cwd: path.join(process.cwd(), env.distFolder, env.vendorFolder)
    })
    for (let key in env.vendors['js']) {
        let manifestPath = path.join(process.cwd(), env.distFolder, env.vendorFolder, key + '-manifest.json')
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
        if (moduleObj.vendor) {
            if (moduleObj.vendor.js) {
                _more.js = vendors.filter(function(v) {
                    let _regexpJS = new RegExp(moduleObj.vendor.js + "-\\w+\\.js$")
                    return _regexpJS.test(v)
                }).map(function(v) {
                    return path.join('..', env.vendorFolder, v)
                })
                _more.css = vendors.filter(function(v) {
                    let _regexpCSS = new RegExp(moduleObj.vendor.css + "-\\w+\\.css$")
                    return _regexpCSS.test(v)
                }).map(function(v) {
                    return path.join('..', env.vendorFolder, v)
                })
            }
        }
        moduleObj.html.forEach(function(html) {
            const output = path.join(env.distFolder, moduleObj.name, path.basename(html))
            htmls.push(new InjectHtmlPlugin({
                processor: function(_url) {
                    const relativePath = path.relative(path.dirname(output),path.dirname(_url)) || '.'
                    return relativePath + path.sep + path.basename(_url)
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