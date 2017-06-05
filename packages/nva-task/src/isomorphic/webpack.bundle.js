import { IgnorePlugin } from 'webpack'
import ProgressBarPlugin from 'progress-bar-webpack-plugin'
import chalk from 'chalk'
import { resolve, join } from 'path'
import { forEach } from 'lodash'
import { existsSync } from 'fs'
import { config as configFactory } from 'nva-core'

export default function(context, constants) {
    const { mods, serverFolder, bundleFolder, sourceFolder } = context
    let entry = {}
    let baseConfig = configFactory(constants)
    let externals = Object.keys(require(resolve('package.json')).dependencies)

    /** build modules */
    forEach(mods, (mod, name) => {
        let bundleEntry = mod.bundleEntry || join(name, name + '-server.js')
        bundleEntry = resolve(sourceFolder, bundleFolder, bundleEntry)
        if (existsSync(bundleEntry)) {
            entry[name] = bundleEntry
        }
    })

    return {
        ...baseConfig,
        entry,
        name: 'bundle',
        target: 'node',
        output: {
            path: resolve(serverFolder, bundleFolder),
            libraryTarget: 'commonjs2',
            filename: '[name].js'
        },
        context: __dirname,
        resolveLoader: {
            modules: [resolve("node_modules"), "node_modules"]
        },
        resolve: { modules: [sourceFolder, resolve("node_modules"), 'node_modules'] },
        externals,
        plugins: [
            ...baseConfig.plugins.slice(1, -1),
            new ProgressBarPlugin({
                format: 'Building bundle [:bar] ' + chalk.green.bold(':percent'),
                clear: false,
                summary: false
            }),
            new IgnorePlugin(/\.(css|less|scss|styl)$/)
        ]
    }
}