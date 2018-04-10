const webpack = require('webpack')
const { resolve } = require('path')
const ProgressPlugin = require('progress-webpack-plugin')
const TidyStatsPlugin = require('tidy-stats-webpack-plugin')
const { config: configFactory } = require('../../../nva-core/lib')
const { merge } = require('../common/helper')

module.exports = function(context, profile) {
  const { serverFolder, distFolder, sourceFolder, serverCompileEntry } = context
  const baseConfig = configFactory(context, profile)
  const externals = Object.keys(require(resolve('package.json')).dependencies)

  return merge(baseConfig, {
    name: 'server',
    entry: [resolve(serverFolder, serverCompileEntry)],
    target: 'node',
    node: {
      __dirname: true,
      __filename: true
    },
    devtool: 'sourcemap',
    output: {
      path: resolve(distFolder, serverFolder),
      filename: serverCompileEntry,
      libraryTarget: 'commonjs2'
    },
    // context: __dirname,
    resolveLoader: {
      modules: [resolve('node_modules'), 'node_modules']
    },
    resolve: {
      modules: [sourceFolder, resolve('node_modules'), 'node_modules']
    },
    externals,
    plugins: baseConfig.plugins.concat([
      new ProgressPlugin(true, { identifier: 'server' }),
      new TidyStatsPlugin({ identifier: 'server' }),
      new webpack.IgnorePlugin(/\.(css|less|scss|styl)$/),
      new webpack.BannerPlugin({
        banner: 'require("source-map-support").install();',
        raw: true,
        entryOnly: false
      })
    ])
  })
}
