import webpack from 'webpack'
import path from 'path'
import ProgressBarPlugin from 'progress-bar-webpack-plugin'
import chalk from 'chalk'
import { config as configFactory } from 'nva-core'

export default function(env, constants, profile) {
    let baseConfig = configFactory({ ...constants, HOT: false }, profile)
    let externals = Object.keys(require(path.join(process.cwd(), 'package.json')).dependencies)

    return {
        ...baseConfig,
        name: 'server',
        entry: ['babel-polyfill', path.join(process.cwd(), env.serverFolder, env.serverEntry)],
        target: 'node',
        node: {
            __dirname: true,
            __filename: true
        },
        output: {
            path: path.join(process.cwd(), env.serverFolder, env.distFolder),
            filename: env.serverEntry,
            libraryTarget: 'commonjs2'
        },
        context: __dirname,
        resolve: { modules: [env.serverFolder, path.join(process.cwd(), "node_modules")] },
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