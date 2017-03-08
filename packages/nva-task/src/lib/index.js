import HappyPack from 'happypack'
import path from 'path'
import os from 'os'
import { find } from 'lodash'
import merge from 'webpack-merge'

import env from './environment'

export { env }

export const DEBUG = process.env.NODE_ENV !== 'production'

export function happypackPlugin(id, loaders) {
    const compilerThreadPool = HappyPack.ThreadPool({ size: os.cpus().length })
    return new HappyPack({
        id,
        tempDir: path.join('.nva', 'temp', 'happypack'),
        verbose: false,
        threadPool: compilerThreadPool,
        loaders
    })
}

export const happypackPlugins = [
    happypackPlugin('js', [{ loader: 'babel-loader', options: { cacheDirectory: true } }]),
    happypackPlugin('less', ['less-loader']),
    happypackPlugin('sass', ['sass-loader']),
    happypackPlugin('stylus', ['stylus-loader'])
]

export function mergeConfig(config) {
    const webpackConfig = Array.isArray(env.webpackConfig) ? env.webpackConfig : [env.webpackConfig]
    if (Array.isArray(config)) {
        return config.map(v => {
            if (v.name) {
                return merge(v, find(webpackConfig, { name: v.name }))
            }
            return merge(v, ...webpackConfig)
        })
    }
    if (config.name) {
        return merge(config, find(webpackConfig, { name: config.name }))
    }
    return merge(config, ...webpackConfig)
}