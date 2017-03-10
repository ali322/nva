import webpack from 'webpack'
import path from 'path'
import fs from 'fs'
import ProgressBarPlugin from 'progress-bar-webpack-plugin'
import chalk from 'chalk'
import { happypackPlugin } from 'nva-core'

const nodeModulesDir = path.join(__dirname, '..', 'node_modules')

export default function(env,constants) {
    const happypackPlugins = [
        happypackPlugin('js', [{ loader: 'babel-loader', options: { cacheDirectory: true } }],constants.HAPPYPACK_TEMP_DIR),
    ]

    var nodeModules = {};
    fs.readdirSync('node_modules')
        .filter(function(x) {
            return ['.bin'].indexOf(x) === -1;
        })
        .forEach(function(mod) {
            nodeModules[mod] = 'commonjs ' + mod;
        });
    return {
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
        module: {
            rules: [{
                test: /\.(es6|jsx|js)$/,
                exclude: [nodeModulesDir],
                loader: 'happypack/loader',
                options: {
                    id: 'js'
                }
            }]
        },
        context: __dirname,
        resolve: { modules: [env.serverFolder, path.join(process.cwd(), "node_modules")] },
        externals: nodeModules,
        plugins: [
            new ProgressBarPlugin({
                format: 'Building server [:bar] ' + chalk.green.bold(':percent'),
                clear: false,
                summary: false
            }),
            new webpack.IgnorePlugin(/\.(css|less)$/),
            new webpack.BannerPlugin({ banner: 'require("source-map-support").install();', raw: true, entryOnly: false }),
            ...happypackPlugins
        ],
        devtool: 'sourcemap'
    }
}