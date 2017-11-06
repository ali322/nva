import { IgnorePlugin } from 'webpack'
import ProgressPlugin from 'progress-webpack-plugin'
import { resolve, join } from 'path'
import { forEach } from 'lodash'
import { existsSync } from 'fs'
import { relativeURL } from '../lib/helper'
import { config as configFactory } from 'nva-core'

export default function (context, profile) {
  const {
    mods,
    serverFolder,
    distFolder,
    bundleFolder,
    sourceFolder
  } = context
  let entry = {}
  let baseConfig = configFactory(context, profile)
  let externals = Object.keys(require(resolve('package.json')).dependencies)

  /** build modules */
  forEach(mods, (mod, name) => {
    let serverBundle = mod.serverBundle
      ? relativeURL(sourceFolder, mod.serverBundle)
      : join(name, name + '-server.js')
    serverBundle = resolve(sourceFolder, serverBundle)
    if (existsSync(serverBundle)) {
      entry[name] = serverBundle
    }
  })

  return {
    ...baseConfig,
    entry,
    name: 'bundle',
    target: 'node',
    output: {
      path: resolve(distFolder, serverFolder, bundleFolder),
      libraryTarget: 'commonjs2',
      filename: '[name].js'
    },
    // context: __dirname,
    resolveLoader: {
      modules: [resolve('node_modules'), 'node_modules']
    },
    resolve: {
      modules: [sourceFolder, resolve('node_modules'), 'node_modules']
    },
    externals,
    plugins: [
      ...baseConfig.plugins.slice(1, -1),
      new ProgressPlugin(true, { identifier: 'bundle' }),
      new IgnorePlugin(/\.(css|less|scss|styl)$/)
    ]
  }
}
