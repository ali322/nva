import path from 'path'
import ExtractTextPlugin from 'extract-text-webpack-plugin'
import { cssLoaders as cssLoadersFactory, postcssOptions } from '../lib'

const nodeModulesDir = path.join(process.cwd(), 'node_modules')

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

    const cssLoaders = cssLoadersFactory(constants)
    const lessLoaders = cssLoadersFactory(constants, 'less')
    const sassLoaders = cssLoadersFactory(constants, 'sass')
    const stylusLoaders = cssLoadersFactory(constants, 'stylus')

    let vueLoaderOptions = {
        postcss: postcssOptions(constants).plugins()
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
    }]

    if (HOT) {
        vueLoaderOptions = {
            ...vueLoaderOptions,
            loaders: {
                css: cssLoadersFactory(constants, '', true),
                less: cssLoadersFactory(constants, 'less', true),
                stylus: cssLoadersFactory(constants, 'stylus', true),
                scss: cssLoadersFactory(constants, 'sass', true)
            }
        }

        _loaders = _loaders.concat([{
            test: /\.jsx$/,
            exclude: [nodeModulesDir],
            use: [
                { loader: "react-hot-loader/webpack" },
                { loader: "happypack/loader", options: { id: "js" } }
            ]
        }, {
            test: /\.less/,
            exclude: [nodeModulesDir],
            use: lessLoaders
        }, {
            test: /\.scss/,
            exclude: [nodeModulesDir],
            use: sassLoaders
        }, {
            test: /\.styl/,
            exclude: [nodeModulesDir],
            use: stylusLoaders
        }, {
            test: /\.css/,
            use: cssLoaders
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
        vueLoaderOptions = {
            ...vueLoaderOptions,
            loaders: {
                css: ExtractTextPlugin.extract({
                    use: cssLoadersFactory(constants, '', true).slice(1),
                    fallback: 'vue-style-loader'
                }),
                less: ExtractTextPlugin.extract({
                    use: cssLoadersFactory(constants, 'less', true).slice(1),
                    fallback: 'vue-style-loader'
                }),
                stylus: ExtractTextPlugin.extract({
                    use: cssLoadersFactory(constants, 'stylus', true).slice(1),
                    fallback: 'vue-style-loader'
                }),
                scss: ExtractTextPlugin.extract({
                    use: cssLoadersFactory(constants, 'sass', true).slice(1),
                    fallback: 'vue-style-loader'
                })
            }
        }

        _loaders = _loaders.concat([{
                test: /\.jsx$/,
                exclude: [nodeModulesDir],
                loader: 'happypack/loader',
                options: {
                    id: 'js'
                }
            }, {
                test: /\.styl/,
                exclude: [nodeModulesDir],
                loader: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: stylusLoaders.slice(1)
                })
            }, {
                test: /\.less/,
                exclude: [nodeModulesDir],
                loader: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: lessLoaders.slice(1)
                })
            }, {
                test: /\.scss/,
                exclude: [nodeModulesDir],
                loader: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: sassLoaders.slice(1)
                })
            }, {
                test: /\.css/,
                loader: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: cssLoaders.slice(1)
                })
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