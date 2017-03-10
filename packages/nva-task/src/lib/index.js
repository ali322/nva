import { find } from 'lodash'
import merge from 'webpack-merge'

import env from './environment'

export { env }

export const DEBUG = process.env.NODE_ENV !== 'production'

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