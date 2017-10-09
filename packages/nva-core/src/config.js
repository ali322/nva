import webpack from 'webpack'
import ExtractTextPlugin from 'extract-text-webpack-plugin'
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'
import loadersFactory from './loaders'
import { happypackPlugin } from './lib'

export default function (constants, strict = false, profile = false) {
  constants.DEV = constants.DEV || false
  let config = {
    profile,
    module: {
      rules: loadersFactory(constants, strict)
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

  const happypackTempDir = constants.CACHE_PATH || '.happypack'

  const happypackPlugins = [
    happypackPlugin(
      'js',
      [
        {
          loader: require.resolve('babel-loader'),
          options: { cacheDirectory: true }
        }
      ],
      happypackTempDir
    )
  ]

  let plugins = [
    new webpack.LoaderOptionsPlugin({
      options: {
        context: __dirname
      }
    }),
    new webpack.NoEmitOnErrorsPlugin(),
    ...happypackPlugins
  ]

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

  let restConfig = constants.DEV
    ? {
        devtool: '#cheap-source-map',
        watch: true,
        performance: { hints: false },
        plugins: [
          ...plugins,
          new webpack.NoEmitOnErrorsPlugin(),
          new webpack.HotModuleReplacementPlugin()
        ]
      }
    : {
        // devtool: "#cheap-module-source-map",
        devtool: profile ? '#cheap-module-source-map' : false,
        plugins: [
          ...plugins,
          new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production')
          }),
          new webpack.optimize.UglifyJsPlugin({
            comments: false,
            sourceMap: false,
            output: {
              comments: false
            }
          }),
          new ExtractTextPlugin({ filename: constants.CSS_OUTPUT })
        ]
      }
  return { ...config, ...restConfig }
}
