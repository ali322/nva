import { resolve, join, basename } from 'path'
import { DllPlugin } from 'webpack'
import ChunkTransformPlugin from 'chunk-transform-webpack-plugin'
import ProgressBarPlugin from 'progress-bar-webpack-plugin'
import chalk from 'chalk'
import { config as configFactory } from 'nva-core'

export default function(context, constants) {
    const { vendors, sourceFolder, distFolder, vendorFolder } = context
    const { VENDOR_OUTPUT, MANIFEST_PATH } = constants
    const baseConfig = configFactory({ ...constants, HOT: false })

    let entryJS = {},
        entryCSS = {},
        cssChunks = []
    for (let key in vendors['js']) {
        entryJS[key] = vendors['js'][key]
    }
    for (let key in vendors['css']) {
        cssChunks.push(key)
        entryCSS[key] = vendors['css'][key]
    }

    const vendorJSConfig = {
        ...baseConfig,
        name: "js",
        entry: entryJS,
        output: {
            path: VENDOR_OUTPUT,
            filename: '[name]-[hash:8].js',
            library: '[name]_[hash]'
        },
        context: __dirname,
        resolve: { modules: [sourceFolder, resolve("node_modules")] },
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

    const vendorCSSConfig = {
        ...baseConfig,
        name: "css",
        entry: entryCSS,
        context: __dirname,
        resolve: { modules: [sourceFolder, resolve("node_modules")] },
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

    return [vendorJSConfig, vendorCSSConfig]
}