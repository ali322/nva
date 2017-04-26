import path from 'path'
import ExtractTextPlugin from 'extract-text-webpack-plugin'
import { cssLoaders, postcssOptions, vueStyleLoaders } from '../lib'

const nodeModulesDir = path.resolve('node_modules')

export default function(constants) {
    const { ASSET_FONT_OUTPUT, ASSET_IMAGE_OUTPUT, IMAGE_PREFIX, FONT_PREFIX, HOT } = constants
    const fileLoaderOptions = {
        publicPath: function(url) {
            var _prefix = ''
            if (/\.(jpg|png|bmp|gif)$/.test(url)) {
                _prefix = IMAGE_PREFIX
            } else if (/\.(ttf|eot|svg|woff(2)?)(\?v=[0-9]\.[0-9]\.[0-9])?$/.test(url)) {
                _prefix = FONT_PREFIX
            }
            return path.join(_prefix, url)
        }
    }

    let vueLoaderOptions = {
        postcss: postcssOptions(constants).plugins(),
        loaders: {
            css: vueStyleLoaders(constants),
            less: vueStyleLoaders(constants, 'less'),
            stylus: vueStyleLoaders(constants, 'stylus'),
            scss: vueStyleLoaders(constants, { loader: 'sass-loader', options: { sourceMap: true } }),
            sass: vueStyleLoaders(constants, { loader: 'sass-loader', options: { indentedSyntax: true, sourceMap: true } }),
        }
    }

    let _loaders = [{
        test: /\.(tpl|html)/,
        exclude: [nodeModulesDir],
        loader: 'html-loader'
    }, {
        test: /\.vue/,
        exclude: [nodeModulesDir],
        loader: 'vue-loader',
        options: vueLoaderOptions
    }, {
        test: /\.(es6|js)$/,
        exclude: [nodeModulesDir],
        loader: 'happypack/loader',
        options: {
            id: "js"
        }
    }, {
        test: /\.less/,
        exclude: [nodeModulesDir],
        use: cssLoaders(constants, 'less')
    }, {
        test: /\.scss/,
        exclude: [nodeModulesDir],
        use: cssLoaders(constants, { loader: 'sass-loader', options: { sourceMap: true } })
    }, {
        test: /\.styl/,
        exclude: [nodeModulesDir],
        use: cssLoaders(constants, 'stylus')
    }, {
        test: /\.css/,
        use: cssLoaders(constants)
    }]

    if (HOT) {
        _loaders = _loaders.concat([{
            test: /\.jsx$/,
            exclude: [nodeModulesDir],
            use: [
                { loader: "react-hot-loader/webpack" },
                { loader: "happypack/loader", options: { id: "js" } }
            ]
        }, {
            test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
            loader: 'url-loader',
            options: {
                limit: 2500,
                mimetype: 'application/font-woff'
            }
        }, {
            test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
            loader: "file-loader",
            options: fileLoaderOptions
        }, {
            test: /\.(png|jpg|gif|bmp)$/,
            exclude: [nodeModulesDir],
            loader: 'url-loader',
            options: {
                limit: 2500
            }
        }])
    } else {
        _loaders = _loaders.concat([{
                test: /\.jsx$/,
                exclude: [nodeModulesDir],
                loader: 'happypack/loader',
                options: {
                    id: 'js'
                }
            }, {
                test: /\.(png|jpg|gif|bmp)$/,
                exclude: [nodeModulesDir],
                use: [{
                        loader: 'url-loader',
                        options: {
                            limit: 2500,
                            ...fileLoaderOptions,
                            outputPath: ASSET_IMAGE_OUTPUT,
                            hash: 'sha512',
                            digest: 'hex',
                            name: '[hash:8].[ext]'
                        }
                    },
                    {
                        loader: 'image-webpack-loader',
                        options: {
                            bypassOnDebug: true,
                            // optimizationLevel: 7,
                            // interlaced: false
                        }
                    }
                ]
            }, {
                test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: 'url-loader',
                options: {
                    limit: 10000,
                    ...fileLoaderOptions,
                    mimetype: "application/font-woff",
                    outputPath: ASSET_FONT_OUTPUT,
                    hash: 'sha512',
                    digest: 'hex',
                    name: '[hash:8].[ext]'
                }
            },
            {
                test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: 'file-loader',
                options: {
                    ...fileLoaderOptions,
                    outputPath: ASSET_FONT_OUTPUT,
                    hash: 'sha512',
                    digest: 'hex',
                    name: '[hash:8].[ext]'
                }
            }
        ])
    }

    return _loaders
}