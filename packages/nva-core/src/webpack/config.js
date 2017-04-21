import webpack from 'webpack'
import chalk from 'chalk'
import ProgressBarPlugin from 'progress-bar-webpack-plugin'
import ExtractTextPlugin from 'extract-text-webpack-plugin'
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'
import loadersFactory from './loaders'
import { happypackPlugin } from '../lib'

export default function(constants, profile = false) {
    let config = {
        profile,
        module: {
            rules: loadersFactory(constants),
        },
        resolve: {
            extensions: [".js", ".json", ".es6", ".jsx", ".styl", ".css", ".less", '.scss'],
        }
    }

    const happypackTempDir = constants.HAPPYPACK_TEMP_DIR || '.happypack'

    const happypackPlugins = [
        happypackPlugin('js', [{ loader: 'babel-loader', options: { cacheDirectory: true } }], happypackTempDir),
        happypackPlugin('less', [{ loader: 'less-loader', options: { sourceMap: true } }], happypackTempDir),
        happypackPlugin('sass', [{ loader: 'sass-loader', options: { sourceMap: true } }], happypackTempDir),
        happypackPlugin('stylus', [{ loader: 'stylus-loader', options: { sourceMap: true } }], happypackTempDir)
    ]

    let plugins = [
        new ProgressBarPlugin({
            format: 'Building [:bar] ' + chalk.green.bold(':percent'),
            clear: false,
            summary: false
        }),
        new webpack.LoaderOptionsPlugin({
            options: {
                context: __dirname
            }
        }),
        ...happypackPlugins
    ]

    if (profile) {
        plugins.push(new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            reportFilename: 'bundle-analyzer-report.html',
            logLevel: 'info'
        }))
    }

    let restConfig = constants.HOT ? {
        devtool: "#eval-source-map",
        watch: true,
        performance: { hints: false },
        plugins: [
            ...plugins,
            new webpack.NoEmitOnErrorsPlugin(),
            new webpack.HotModuleReplacementPlugin()
        ]
    } : {
        // devtool: "#cheap-module-source-map",
        devtool: false,
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