import path from 'path'
import ExtractTextPlugin from 'extract-text-webpack-plugin'
import autoPrefixer from 'autoprefixer'
import sprites from 'postcss-sprites'

const nodeModulesDir = path.join(process.cwd(), 'node_modules')

export default function(constants) {
    const { ASSET_FONT_OUTPUT, ASSET_IMAGE_OUTPUT, SPRITE_OUTPUT, IMAGE_PREFIX, FONT_PREFIX } = constants
    const postcssOptions = {
        plugins: function() {
            let plugins = [
                autoPrefixer()
            ]
            if (!constants.HOT) {
                plugins.push(sprites({
                    spritePath: SPRITE_OUTPUT
                }))
            }
            return plugins
        }
    }
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

    const cssLoaders = [
        { loader: 'style-loader' },
        { loader: 'css-loader', options: { minimize: !constants.HOT } },
        { loader: 'postcss-loader', options: postcssOptions },
        { loader: 'resolve-url-loader' }
    ]
    const lessLoaders = [...cssLoaders, { loader: 'happypack/loader', options: { id: "less" } }]
    const sassLoaders = [...cssLoaders, { loader: 'happypack/loader', options: { id: "sass" } }]
    const stylusLoaders = [...cssLoaders, { loader: 'happypack/loader', options: { id: "stylus" } }]

    const vueLoaderOptions = constants.HOT ? {
        loaders: {
            css: [...cssLoaders.slice(0, -2),'resolve-url-loader'],
            less: [...cssLoaders.slice(0, -2), 'less-loader'],
            stylus: [...cssLoaders.slice(0, -2), 'stylus-loader']
        }
    } : {
        loaders: {
            css: ExtractTextPlugin.extract({
                use: [{ loader: 'css-loader' }, { loader: "resolve-url-loader" }],
                fallback: 'vue-style-loader'
            }),
            less: ExtractTextPlugin.extract({
                use: [
                    { loader: 'css-loader' }, { loader: "resolve-url-loader" },
                    { loader: 'less-loader', options: { sourceMap: true } }
                ],
                fallback: 'vue-style-loader'
            }),
            stylus: ExtractTextPlugin.extract({
                use: [
                    { loader: 'css-loader' }, { loader: "resolve-url-loader" },
                    { loader: 'stylus-loader', options: { sourceMap: true } }
                ],
                fallback: 'vue-style-loader'
            }),
            scss: ExtractTextPlugin.extract({
                use: [
                    { loader: 'css-loader' }, { loader: "resolve-url-loader" },
                    { loader: 'sass-loader', options: { sourceMap: true } }
                ],
                fallback: 'vue-style-loader'
            })
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
    }]
    _loaders = constants.HOT ? _loaders.concat([{
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
        test: /\.(png|jpg)$/,
        exclude: [nodeModulesDir],
        loader: 'url-loader',
        options: {
            limit: 2500
        }
    }]) : _loaders.concat([{
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
            test: /\.(png|jpg)$/,
            exclude: [nodeModulesDir],
            use: [{
                    loader: 'url-loader',
                    options: {
                        limit: 2500,
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
    return _loaders
}