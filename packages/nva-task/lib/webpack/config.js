const webpack = require('webpack')
const MiniCSSExtractPlugin = require('mini-css-extract-plugin')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const { CheckerPlugin } = require('awesome-typescript-loader')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const loadersFactory = require('./loaders')
const { happypackPlugin } = require('./util')
const assign = require('lodash/assign')
const mapValues = require('lodash/mapValues')

module.exports = (context, profile = false) => {
  const config = {
    profile,
    module: {
      rules: loadersFactory(context)
    },
    resolve: {
      extensions: [
        '.js',
        '.json',
        '.es6',
        '.jsx',
        '.ts',
        '.tsx',
        '.styl',
        '.css',
        '.less',
        '.scss'
      ]
    }
  }

  const happypackPlugins = [
    happypackPlugin(
      'js',
      [
        {
          loader: 'babel-loader',
          options: { cacheDirectory: true }
        }
      ]
    )
  ]

  let plugins = [
    new CheckerPlugin()
  ].concat(happypackPlugins)

  if (profile) {
    plugins.push(
      new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        reportFilename: 'bundle-analyzer-report.html',
        openAnalyzer: false,
        logLevel: 'info'
      })
    )
  }

  const restConfig = context.isDev
    ? {
      devtool: '#eval-source-map',
      watch: true,
      // performance: { hints: false },
      mode: 'development',
      plugins: plugins.concat([
        new webpack.HotModuleReplacementPlugin(),
        new webpack.DefinePlugin(assign({}, {
          'process.env.NODE_ENV': JSON.stringify('development')
        }, mapValues(context.env, v => JSON.stringify(v))))
      ])
    }
    : {
      // devtool: "#cheap-module-source-map",
      devtool: profile ? '#eval-source-map' : false,
      mode: 'production',
      plugins: plugins.concat([
        new MiniCSSExtractPlugin({ filename: context.output.cssPath }),
        new OptimizeCSSAssetsPlugin(),
        new webpack.DefinePlugin(assign({}, {
          'process.env.NODE_ENV': JSON.stringify('production')
        }, mapValues(context.env, v => JSON.stringify(v))))
      ])
    }
  return assign({}, config, restConfig)
}