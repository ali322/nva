import webpack from 'webpack'
import path from 'path'
import fs from 'fs'
import ProgressBarPlugin from 'progress-bar-webpack-plugin'
import chalk from 'chalk'
import { config as configFactory } from 'nva-core'

export default function(env, constants) {
    let baseConfig = configFactory({ ...constants, HOT: false })

    var nodeModules = {};
    fs.readdirSync('node_modules')
        .filter(function(x) {
            return ['.bin'].indexOf(x) === -1;
        })
        .forEach(function(mod) {
            nodeModules[mod] = 'commonjs ' + mod;
        });
    return {
        ...baseConfig,
        name: 'server',
        entry: ['babel-polyfill', path.join(process.cwd(), env.serverFolder, env.serverEntryJS)],
        target: 'node',
        node: {
            __dirname: true,
            __filename: true
        },
        output: {
            path: path.join(process.cwd(), env.serverFolder, env.distFolder),
            filename: env.serverEntryJS,
            libraryTarget: 'commonjs2'
        },
        context: __dirname,
        resolve: { modules: [env.serverFolder, path.join(process.cwd(), "node_modules")] },
        externals: nodeModules,
        plugins: [
            ...baseConfig.plugins.slice(1),
            new ProgressBarPlugin({
                format: 'Building server [:bar] ' + chalk.green.bold(':percent'),
                clear: false,
                summary: false
            }),
            new webpack.IgnorePlugin(/\.(css|less)$/),
            new webpack.BannerPlugin({ banner: 'require("source-map-support").install();', raw: true, entryOnly: false }),
        ],
        devtool: 'sourcemap'
    }
}