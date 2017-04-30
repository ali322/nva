import webpack from 'webpack'
import { resolve } from 'path'
import ProgressBarPlugin from 'progress-bar-webpack-plugin'
import chalk from 'chalk'
import { config as configFactory } from 'nva-core'

export default function(context, constants, profile) {
    const { serverFolder, distFolder, sourceFolder, serverEntry } = context
    let baseConfig = configFactory({ ...constants, HOT: false }, profile)
    let externals = Object.keys(require(resolve('package.json')).dependencies)

    return {
        ...baseConfig,
        name: 'server',
        entry: ['babel-polyfill', resolve(serverFolder, serverEntry)],
        target: 'node',
        node: {
            __dirname: true,
            __filename: true
        },
        output: {
            path: resolve(serverFolder, distFolder),
            filename: serverEntry,
            libraryTarget: 'commonjs2'
        },
        context: __dirname,
        resolveLoader: {
            modules: [resolve("node_modules"), "node_modules"]
        },
        resolve: { modules: [sourceFolder, resolve("node_modules"), 'node_modules'] },
        externals,
        plugins: [
            ...baseConfig.plugins.slice(1),
            new ProgressBarPlugin({
                format: 'Building server [:bar] ' + chalk.green.bold(':percent'),
                clear: false,
                summary: false
            }),
            new webpack.IgnorePlugin(/\.(css|less|scss|styl)$/),
            new webpack.BannerPlugin({ banner: 'require("source-map-support").install();', raw: true, entryOnly: false }),
        ],
        devtool: 'sourcemap'
    }
}