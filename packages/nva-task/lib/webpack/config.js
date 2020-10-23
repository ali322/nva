const webpack = require('webpack')
const MiniCSSExtractPlugin = require('mini-css-extract-plugin')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const TerserPlugin = require('terser-webpack-plugin')
const CSSMinimizerPlugin = require('css-minimizer-webpack-plugin')
const loadersFactory = require('./loaders')
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

  const restConfig = context.isDev
    ? {
      devtool: 'source-map',
      // watch: true,
      // performance: { hints: false },
      mode: 'development',
      plugins: plugins.concat([
        new webpack.HotModuleReplacementPlugin(),
        new webpack.DefinePlugin(
          assign(
            {},
            {
              'process.env.NODE_ENV': JSON.stringify(
                'development'
              )
            },
            mapValues(context.env, (v) => JSON.stringify(v))
          )
        )
      ])
    }
    : {
      // devtool: "#cheap-module-source-map",
      devtool: profile ? 'source-map' : false,
      mode: 'production',
      optimization: {
        minimize: true,
        minimizer: [new TerserPlugin({
          parallel: true
        }), new CSSMinimizerPlugin()]
      },
      plugins: plugins.concat([
        new webpack.DefinePlugin(
          assign(
            {},
            {
              'process.env.NODE_ENV': JSON.stringify(
                'production'
              )
            },
            mapValues(context.env, (v) => JSON.stringify(v))
          )
        ),
        new MiniCSSExtractPlugin({ filename: context.output.cssPath })
      ])
    }
  return assign({}, config, restConfig)
}