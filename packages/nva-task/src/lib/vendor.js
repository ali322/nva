import { resolve, join, basename } from 'path'
import { DllPlugin } from 'webpack'
import ChunkTransformPlugin from 'chunk-transform-webpack-plugin'
import ProgressBarPlugin from 'progress-bar-webpack-plugin'
import chalk from 'chalk'
import { isEmpty, isPlainObject } from 'lodash'
import { config as configFactory } from 'nva-core'

export default function(context, constants) {
    const { vendors, sourceFolder, distFolder, vendorFolder } = context
    const { VENDOR_OUTPUT, MANIFEST_PATH } = constants
    const baseConfig = configFactory({ ...constants, HOT: false })

    let entryJS = {},
        entryCSS = {},
        cssChunks = []
    if (isPlainObject(vendors['js'])) {
        for (let key in vendors['js']) {
            entryJS[key] = vendors['js'][key]
        }
    }
    if (isPlainObject(vendors['css'])) {
        for (let key in vendors['css']) {
            cssChunks.push(key)
            entryCSS[key] = vendors['css'][key]
        }
    }

    const jsConfig = {
        ...baseConfig,
        name: "js",
        entry: entryJS,
        output: {
            path: VENDOR_OUTPUT,
            filename: '[name]-[hash:8].js',
            library: '[name]_[hash]'
        },
        context: __dirname,
        resolve: { modules: [sourceFolder, 'node_modules', resolve("node_modules")] },
        plugins: [
            ...baseConfig.plugins.slice(1),
            new ProgressBarPlugin({
                format: 'Building vendor:js [:bar] ' + chalk.green.bold(':percent'),
                clear: false,
                summary: false
            }),
            new DllPlugin({
                name: '[name]_[hash]',
                path: resolve(MANIFEST_PATH, '[name]-manifest.json'),
                context: __dirname
            })
        ]
    }

    const cssConfig = {
        ...baseConfig,
        name: "css",
        entry: entryCSS,
        context: __dirname,
        resolve: { modules: [sourceFolder, 'node_modules', resolve("node_modules")] },
        output: {
            path: constants.OUTPUT_PATH
        },
        plugins: [
            ...baseConfig.plugins.slice(1),
            new ProgressBarPlugin({
                format: 'Building vendor:css [:bar] ' + chalk.green.bold(':percent'),
                clear: false,
                summary: false
            }),
            new ChunkTransformPlugin({
                chunks: cssChunks,
                test: /\.css/,
                filename: function(filename) { return join(distFolder, vendorFolder, basename(filename)) }
            })
        ]
    }

    let vendorConfig = []
    if (!isEmpty(entryJS)) {
        vendorConfig.push(jsConfig)
    }
    if (!isEmpty(entryCSS)) {
        vendorConfig.push(cssConfig)
    }

    return vendorConfig
}