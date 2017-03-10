import webpack from 'webpack'
import path from 'path'
import glob from 'glob'
import InjectHtmlPlugin from 'inject-html-webpack-plugin'
import ProgressBarPlugin from 'progress-bar-webpack-plugin'
import chalk from 'chalk'
import { bundleTime, checkManifest } from '../lib/helper'
import { config as configFactory } from 'nva-core'

export default function(env, constants) {
    /** build variables*/
    let entry = {};
    let htmls = [];
    let baseConfig = configFactory({ ...constants, HOT: false })

    /** add vendors reference*/
    let dllRefs = []
    let vendors = []
    vendors = glob.sync('*.{js,css}', {
        cwd: path.join(process.cwd(), env.clientPath, env.distFolder, env.vendorFolder)
    })
    for (let key in env.vendors['js']) {
        let manifestPath = path.join(process.cwd(), env.clientPath, env.distFolder, env.vendorFolder, key + '-manifest.json')
        checkManifest(manifestPath)
        let _manifest = require(manifestPath)
        dllRefs.push(new webpack.DllReferencePlugin({
            context: path.resolve(env.clientPath),
            manifest: _manifest,
        }))
    }

    /** build modules*/
    env.modules.forEach(function(moduleObj) {
        entry[moduleObj.name] = [moduleObj.entryJS, moduleObj.entryCSS]
        let _chunks = [moduleObj.name]
        let _more = { js: [], css: [] }
        if (moduleObj.vendor) {
            if (moduleObj.vendor.js) {
                _more.js = vendors.filter(function(v) {
                    var _regexp = new RegExp(moduleObj.vendor.js + "-\\w+\\.js$")
                    return _regexp.test(v)
                }).map(function(v) {
                    return path.join(path.sep, env.distFolder, env.vendorFolder, v)
                })
                _more.css = vendors.filter(function(v) {
                    var _regexp = new RegExp(moduleObj.vendor.css + "-\\w+\\.css$")
                    return _regexp.test(v)
                }).map(function(v) {
                    return path.join(path.sep, env.distFolder, env.vendorFolder, v)
                })
            }
        }
        moduleObj.html.forEach(function(html) {
            htmls.push(new InjectHtmlPlugin({
                processor: path.sep,
                chunks: _chunks,
                filename: html,
                more: _more,
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
        name: 'client',
        entry,
        output: {
            path: constants.OUTPUT_PATH,
            filename: path.join(env.distFolder, "[name]", "[name]-[hash:8].js"),
            chunkFilename: path.join(env.distFolder, "[name]", "[id]-[hash:8].chunk.js")
        },
        context: __dirname,
        resolve: { modules: [env.clientPath, path.join(process.cwd(), "node_modules")] },
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