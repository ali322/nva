import webpack from 'webpack'
import chalk from 'chalk'
import FriendlyErrorsPlugin from 'friendly-errors-webpack-plugin'
import ProgressBarPlugin from 'progress-bar-webpack-plugin'
import loadersFactory from './loaders'
import { happypackPlugins } from '../lib'

export default function(constants) {
    let config = {
        module: {
            rules: loadersFactory(constants),
        },
        resolve: {
            extensions: [".js", ".json", ".es6", ".jsx", ".styl", ".css", ".less", '.scss'],
        }
    }

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

    let restConfig = constants.HOT ? {
        devtool: "#inline-source-map",
        watch: true,
        performance: { hints: false },
        plugins: [
            ...plugins,
            new webpack.HotModuleReplacementPlugin(),
            new FriendlyErrorsPlugin({ clearConsole: false }),
            new webpack.NoEmitOnErrorsPlugin()
        ]
    } : {
        devtool: false,
        plugins: [
            ...plugins,
            new webpack.DefinePlugin({
                'process.env.NODE_ENV': JSON.stringify('production')
            }),
            new webpack.optimize.UglifyJsPlugin({
                comments:false,
                sourceMap:false,
                output: {
                    comments: false
                }
            }),
        ]
    }
    return { ...config, ...restConfig }
}