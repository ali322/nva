import webpack from 'webpack'
import { join } from 'path'
import ExtractTextPlugin from 'extract-text-webpack-plugin'
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'
import loadersFactory from './loaders'
import { happypackPlugin } from './lib'

export default function (context, profile = false) {
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

  const happypackTempDir = context.compilerCache
    ? join(context.compilerCache, 'happypack')
    : '.happypack'

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

  let restConfig = context.isDev
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
          new webpack.HashedModuleIdsPlugin({
            hashFunction: 'sha256',
            hashDigest: 'hex',
            hashDigestLength: 10
          }),
          new webpack.optimize.UglifyJsPlugin({
            comments: false,
            sourceMap: false,
            output: {
              comments: false
            }
          }),
          new ExtractTextPlugin({ filename: context.output.cssPath })
        ]
      }
  return { ...config, ...restConfig }
}
