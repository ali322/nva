const webpack = require('webpack')
const MiniCSSExtractPlugin = require('mini-css-extract-plugin')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const TerserPlugin = require('terser-webpack-plugin')
const CSSMinimizerPlugin = require('css-minimizer-webpack-plugin')
const loadersFactory = require('./loaders')
const merge = require('lodash/merge')
const mapValues = require('lodash/mapValues')

module.exports = (context, profile = false, isWeb = true) => {
  let extensions = ['.js', '.json', '.ts']
  if (isWeb) {
    extensions = extensions.concat([
      '.tsx',
      '.jsx',
      '.styl',
      '.css',
      '.less',
      '.scss'
    ])
  }

  const config = {
    profile,
    module: {
      rules: loadersFactory(context, isWeb)
    },
    resolve: {
      extensions
    }
  }

  let plugins = []

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

  plugins.push(
    new webpack.DefinePlugin(
      merge(
        {},
        {
          'process.env.NODE_ENV': JSON.stringify(
            context.isDev ? 'development' : 'production'
          )
        },
        mapValues(context.env, (v) => JSON.stringify(v))
      )
    )
  )

  let restConfig = context.isDev
    ? {
      devtool: 'source-map',
      // watch: true,
      // performance: { hints: false },
      mode: 'development',
      plugins
    }
    : {
      // devtool: "#cheap-module-source-map",
      // devtool: profile ? 'source-map' : false,
      mode: 'production',
      optimization: {
        minimize: true,
        minimizer: [
          new TerserPlugin({
            parallel: true
          })
        ]
      },
      plugins
    }

  if (isWeb) {
    restConfig = context.isDev
      ? merge({}, restConfig, {
        plugins: [new webpack.HotModuleReplacementPlugin()].concat(
          restConfig.plugins
        )
      })
      : merge({}, restConfig, {
        optimization: {
          minimize: true,
          minimizer: [
            new TerserPlugin({
              parallel: true
            }),
            new CSSMinimizerPlugin()
          ]
        },
        plugins: restConfig.plugins.concat([
          new MiniCSSExtractPlugin({ filename: context.output.cssPath })
        ])
      })
  }
  return merge({}, config, restConfig)
}