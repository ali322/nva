const webpack = require('webpack')
const { resolve } = require('path')
const ProgressPlugin = require('progress-webpack-plugin')
const TidyStatsPlugin = require('tidy-stats-webpack-plugin')
const configFactory = require('../webpack/config')
const { merge } = require('nva-util')

module.exports = function(context, profile) {
  const {
    serverFolder,
    distFolder,
    serverEntry,
    logText
  } = context
  const baseConfig = configFactory(context, profile)
  const externals = Object.keys(require(resolve('package.json')).dependencies)

  return merge(baseConfig, {
    name: 'server',
    entry: [resolve(serverFolder, serverEntry)],
    target: 'node',
    node: {
      __dirname: true,
      __filename: true
    },
    devtool: 'sourcemap',
    output: {
      path: resolve(distFolder, serverFolder),
      filename: serverEntry,
      libraryTarget: 'commonjs2'
    },
    // context: __dirname,
    externals,
    plugins: baseConfig.plugins.concat([
      new ProgressPlugin({
        identifier: 'server'
      }),
      new TidyStatsPlugin({
        identifier: 'server',
        logText: {
          success: logText.buildSuccess,
          warn: logText.buildWarn,
          error: logText.buildError
        }
      }),
      new webpack.IgnorePlugin(/\.(css|less|scss|styl)$/),
      new webpack.BannerPlugin({
        banner: 'require("source-map-support").install();',
        raw: true,
        entryOnly: false
      })
    ])
  })
}
