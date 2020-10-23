const { IgnorePlugin } = require('webpack')
const ProgressPlugin = require('progress-webpack-plugin')
const TidyStatsPlugin = require('tidy-stats-webpack-plugin')
const nodeExternals = require('webpack-node-externals')
const { resolve, join } = require('path')
const forEach = require('lodash/forEach')
const { existsSync } = require('fs')
const { relativeURL, merge } = require('nva-util')
const configFactory = require('../webpack/config')

module.exports = function(context, profile) {
  const {
    mods,
    serverFolder,
    distFolder,
    bundleFolder,
    sourceFolder,
    logText
  } = context
  let entry = {}
  const baseConfig = configFactory(context, profile)
  //   let externals = Object.keys(require(resolve('package.json')).dependencies)
  const externals = nodeExternals({ allowlist: /\.css$/ })

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

  return merge(baseConfig, {
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
    plugins: baseConfig.plugins.slice(0, -1).concat([
      new ProgressPlugin({
        identifier: 'bundle'
      }),
      new TidyStatsPlugin({
        identifier: 'bundle',
        logText: {
          success: logText.buildSuccess,
          warn: logText.buildWarn,
          error: logText.buildError
        }
      }),
      new IgnorePlugin(/\.(css|less|scss|styl)$/)
    ])
  })
}
