let webpack = require('webpack')
let MiniCSSExtractPlugin = require('mini-css-extract-plugin')
let { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
let loadersFactory = require('./loaders')
let { happypackPlugin } = require('./lib')
let assign = require('lodash/assign')

module.exports = (context, profile = false) => {
  let config = {
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
        '.styl',
        '.css',
        '.less',
        '.scss'
      ]
    }
  }

  const happypackPlugins = [
    // happypackPlugin(
    //   'js',
    //   [
    //     {
    //       loader: require.resolve('babel-loader'),
    //       options: { cacheDirectory: true }
    //     }
    //   ]
    // )
  ]

  let plugins = [].concat(happypackPlugins)

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

  let restConfig = context.isDev
    ? {
      devtool: '#eval-source-map',
      watch: true,
      // performance: { hints: false },
      mode: 'development',
      plugins: plugins.concat([
        new webpack.HotModuleReplacementPlugin()
      ])
    }
    : {
      // devtool: "#cheap-module-source-map",
      devtool: profile ? '#eval-source-map' : false,
      mode: 'production',
      plugins: plugins.concat([
        new MiniCSSExtractPlugin({ filename: context.output.cssPath })
      ])
    }
  return assign({}, config, restConfig)
}