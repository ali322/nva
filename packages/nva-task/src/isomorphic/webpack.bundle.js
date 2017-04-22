import webpack from 'webpack'
import ProgressBarPlugin from 'progress-bar-webpack-plugin'
import chalk from 'chalk'
import path from 'path'
import fs from 'fs'
import { config as configFactory } from 'nva-core'

export default function(env, constants) {
    let entry = {}
    let baseConfig = configFactory(constants)
    let externals = Object.keys(require(path.join(process.cwd(), 'package.json')).dependencies)

    /** build modules */
    env.modules.forEach(moduleObj => {
        if (fs.existsSync(moduleObj.bundleEntry)) {
            entry[moduleObj.name] = moduleObj.bundleEntry
        }
    })
    return {
        ...baseConfig,
        entry,
        name: 'bundle',
        target: 'node',
        output: {
            path: path.join(process.cwd(), env.serverFolder, env.bundleFolder),
            libraryTarget: 'commonjs2',
            filename: '[name].js'
        },
        context: __dirname,
        resolveLoader: {
            modules: [path.join(process.cwd(), "node_modules"), "node_modules"]
        },
        resolve: { modules: [env.sourcePath, path.join(process.cwd(), "node_modules")] },
        externals,
        plugins: [
            ...baseConfig.plugins.slice(1, -1),
            new ProgressBarPlugin({
                format: 'Building bundle [:bar] ' + chalk.green.bold(':percent'),
                clear: false,
                summary: false
            }),
            new webpack.IgnorePlugin(/\.(css|less|scss|styl)$/)
        ]
    }
}