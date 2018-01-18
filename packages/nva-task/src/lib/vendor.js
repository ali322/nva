import { resolve, join, basename } from 'path'
import { DllPlugin } from 'webpack'
import ChunkTransformPlugin from 'chunk-transform-webpack-plugin'
import ProgressPlugin from 'progress-webpack-plugin'
import { isEmpty, isPlainObject } from 'lodash'
import { config as configFactory } from 'nva-core'

export default function (context) {
    const {
        vendors,
        sourceFolder,
        vendorFolder,
        vendorDevFolder,
        output,
        isDev
    } = context
    const baseConfig = configFactory(context)

    let entryJS = {},
        entryCSS = {},
        cssChunks = [],
        vendorConfig = []
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
        // devtool: false,
        name: 'js',
        entry: entryJS,
        output: {
            path: resolve(isDev ? output.vendorDevPath : output.vendorPath),
            filename: '[name]-[hash:8].js',
            library: '[name]_[hash]'
        },
        resolve: {
            modules: [sourceFolder, 'node_modules', resolve('node_modules')]
        },
        plugins: [
            ...baseConfig.plugins.slice(0, -1),
            new ProgressPlugin(true, { identifier: 'vendor:js' }),
            new DllPlugin({
                name: '[name]_[hash]',
                path: resolve(
                    isDev ? output.vendorDevPath : output.vendorPath,
                    '[name]-manifest.json'
                ),
                context: __dirname
            })
        ]
    }

    if (!isEmpty(entryJS)) {
        vendorConfig.push(jsConfig)
    }

    const baseCSSConfig = configFactory({
        ...context,
        isDev: false
    })
    const cssConfig = {
        ...baseCSSConfig,
        name: 'css',
        entry: entryCSS,
        resolve: {
            modules: [sourceFolder, 'node_modules', resolve('node_modules')]
        },
        output: {
            path: output.path
        },
        plugins: [
            ...baseCSSConfig.plugins,
            new ProgressPlugin(true, { identifier: 'vendor:css' }),
            new ChunkTransformPlugin({
                chunks: cssChunks,
                test: /\.css$/,
                filename: function (filename) {
                    return join(
                        isDev ? vendorDevFolder : vendorFolder,
                        basename(filename)
                    )
                }
            })
        ]
    }

    if (!isEmpty(entryCSS)) {
        vendorConfig.push(cssConfig)
    }

    return vendorConfig
}
