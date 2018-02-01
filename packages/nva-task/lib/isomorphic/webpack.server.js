let webpack = require('webpack')
let { resolve } = require('path')
let ProgressPlugin = require('progress-webpack-plugin')
let { config: configFactory } = require('nva-core')
let { merge } = require('../common/helper')

module.exports = function (context, profile) {
  const {
    serverFolder,
    distFolder,
    sourceFolder,
    serverEntry
  } = context
  let baseConfig = configFactory(context, profile)
  let externals = Object.keys(require(resolve('package.json')).dependencies)

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
    resolveLoader: {
      modules: [resolve('node_modules'), 'node_modules']
    },
    resolve: {
      modules: [sourceFolder, resolve('node_modules'), 'node_modules']
    },
    externals,
    plugins: baseConfig.plugins.concat([
      new ProgressPlugin(true, { identifier: 'server' }),
      new webpack.IgnorePlugin(/\.(css|less|scss|styl)$/),
      new webpack.BannerPlugin({
        banner: 'require("source-map-support").install();',
        raw: true,
        entryOnly: false
      })
    ])
  })
}
