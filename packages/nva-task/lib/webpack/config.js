const webpack = require('webpack')
const MiniCSSExtractPlugin = require('mini-css-extract-plugin')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const TerserPlugin = require('terser-webpack-plugin')
const CSSMinimizerPlugin = require('css-minimizer-webpack-plugin')
const loadersFactory = require('./loaders')
const merge = require('lodash/merge')
const mapValues = require('lodash/mapValues')
const { resolve } = require('path')

module.exports = (context, profile = false, isWeb = true) => {
  const { sourceFolder, isDev, env, output, loaderOptions } = context
  let extensions = ['*', '.js', '.mjs', '.json', '.ts']
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
    resolveLoader: {
      modules: [resolve('node_modules'), 'node_modules']
    },
    resolve: {
      extensions,
      modules: [sourceFolder, resolve('node_modules'), 'node_modules']
    }
  }

  let plugins = []

  const useLegacyVueLoader = !!(loaderOptions.vue && loaderOptions.vue.legacy)
  if (!useLegacyVueLoader) {
    const { VueLoaderPlugin } = require('vue-loader')
    plugins.push(new VueLoaderPlugin())
  }

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
            isDev ? 'development' : 'production'
          )
        },
        mapValues(env, (v) => JSON.stringify(v))
      )
    )
  )

  let restConfig = isDev
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
    restConfig = isDev
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
          new MiniCSSExtractPlugin({ filename: output.cssPath })
        ])
      })
  }
  return merge({}, config, restConfig)
}
