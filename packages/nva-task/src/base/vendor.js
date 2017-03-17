import path from 'path'
import webpack from 'webpack'
import ExtractTextPlugin from 'extract-text-webpack-plugin'
import ChunkTransformPlugin from 'chunk-transform-webpack-plugin'
import ProgressBarPlugin from 'progress-bar-webpack-plugin'
import chalk from 'chalk'
import {config as configFactory} from 'nva-core'

export default function(env, constants) {
    const { VENDOR_OUTPUT, MANIFEST_PATH } = constants
    const baseConfig = configFactory({ ...constants, HOT: false })

    let entryJS = {},
        entryCSS = {},
        vendorCSSChunks = []
    for (let key in env.vendors['js']) {
        entryJS[key] = env.vendors['js'][key]
    }
    for (let key in env.vendors['css']) {
        vendorCSSChunks.push(key)
        entryCSS[key] = env.vendors['css'][key]
    }

    const vendorJSConfig = {
        ...baseConfig,
        name: "vendor:js",
        entry: entryJS,
        output: {
            path: VENDOR_OUTPUT,
            filename: '[name]-[chunkhash:8].js',
            library: '[name]_[hash]'
        },
        context: __dirname,
        resolve: { modules: [env.sourcePath, path.join(process.cwd(), "node_modules")] },
        plugins: [
            ...baseConfig.plugins.slice(1),
            new ProgressBarPlugin({
                format: 'Building vendor:js [:bar] ' + chalk.green.bold(':percent'),
                clear: false,
                summary: false
            }),
            new webpack.DllPlugin({
                name: '[name]_[hash]',
                path: path.resolve(path.join(MANIFEST_PATH, '[name]-manifest.json')),
                context: __dirname
            })
        ]
    }

    const vendorCSSConfig = {
        ...baseConfig,
        name: "vendor:css",
        entry: entryCSS,
        context: __dirname,
        resolve: { modules: [env.sourcePath, path.join(process.cwd(), "node_modules")] },
        output: {
            path: constants.OUTPUT_PATH
        },
        plugins: [
            ...baseConfig.plugins.slice(1,-1),
            new ProgressBarPlugin({
                format: 'Building vendor:css [:bar] ' + chalk.green.bold(':percent'),
                clear: false,
                summary: false
            }),
            new ExtractTextPlugin(path.join(env.distFolder, "[name]", "[name]-[hash:8].css")),
            new ChunkTransformPlugin({
                chunks: vendorCSSChunks,
                test: /\.css/,
                filename: function(filename) { return path.join(env.distFolder, env.vendorFolder, path.basename(filename)) }
            })
        ]
    }

    return [vendorJSConfig, vendorCSSConfig]
}