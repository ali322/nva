'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = function (constants) {
    var ASSET_FONT_OUTPUT = constants.ASSET_FONT_OUTPUT,
        ASSET_IMAGE_OUTPUT = constants.ASSET_IMAGE_OUTPUT,
        SPRITE_OUTPUT = constants.SPRITE_OUTPUT,
        ASSET_INPUT = constants.ASSET_INPUT,
        IMAGE_PREFIX = constants.IMAGE_PREFIX,
        FONT_PREFIX = constants.FONT_PREFIX;

    var postcssOptions = {
        plugins: function plugins() {
            var plugins = [(0, _postcssImport2.default)({ addDependencyTo: true }), (0, _autoprefixer2.default)(), (0, _postcssUrl2.default)({
                url: function url(originURL, decl, from, dirname, to) {
                    return (0, _helper.urlResolver)(originURL, from, to, ASSET_INPUT);
                }
            })];
            if (!constants.HOT) {
                plugins.push((0, _postcssSprites2.default)({
                    spritePath: SPRITE_OUTPUT
                }));
            }
            return plugins;
        }
    };
    var fileLoaderOptions = {
        publicPath: function publicPath(url) {
            var _prefix = '';
            if (/\.(jpg|png|bmp|gif)$/.test(url)) {
                _prefix = IMAGE_PREFIX;
            } else if (/\.(ttf|eot|svg|woff(2)?)(\?v=[0-9]\.[0-9]\.[0-9])?$/.test(url)) {
                _prefix = FONT_PREFIX;
            }
            return _path2.default.join(_prefix, url);
        }
    };

    var cssLoaders = [{ loader: 'style-loader' }, { loader: 'css-loader', options: { minimize: !constants.HOT } }, { loader: 'postcss-loader', options: postcssOptions }];
    var lessLoaders = [].concat(cssLoaders, [{ loader: 'happypack/loader', options: { id: "less" } }]);
    var sassLoaders = [].concat(cssLoaders, [{ loader: 'happypack/loader', options: { id: "sass" } }]);
    var stylusLoaders = [].concat(cssLoaders, [{ loader: 'happypack/loader', options: { id: "stylus" } }]);

    var vueLoaderOptions = constants.HOT ? {
        loaders: {
            css: cssLoaders.slice(0, -1),
            less: [].concat(_toConsumableArray(cssLoaders.slice(0, -1)), ['less-loader']),
            stylus: [].concat(_toConsumableArray(cssLoaders.slice(0, -1)), ['stylus-loader'])
        }
    } : {
        loaders: {
            css: _extractTextWebpackPlugin2.default.extract({
                use: [cssLoaders[1]],
                fallback: 'vue-style-loader'
            }),
            less: _extractTextWebpackPlugin2.default.extract({
                use: [cssLoaders[1], 'less-loader'],
                fallback: 'vue-style-loader'
            }),
            stylus: _extractTextWebpackPlugin2.default.extract({
                use: [cssLoaders[1], 'stylus-loader'],
                fallback: 'vue-style-loader'
            })
        }
    };

    var _loaders = [{
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
    }];
    _loaders = constants.HOT ? _loaders.concat([{
        test: /\.jsx$/,
        exclude: [nodeModulesDir],
        use: [{ loader: "react-hot-loader/webpack" }, { loader: "happypack/loader", options: { id: "js" } }]
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
        loader: _extractTextWebpackPlugin2.default.extract({
            fallback: 'style-loader',
            use: stylusLoaders.slice(1)
        })
    }, {
        test: /\.less/,
        exclude: [nodeModulesDir],
        loader: _extractTextWebpackPlugin2.default.extract({
            fallback: 'style-loader',
            use: lessLoaders.slice(1)
        })
    }, {
        test: /\.scss/,
        exclude: [nodeModulesDir],
        loader: _extractTextWebpackPlugin2.default.extract({
            fallback: 'style-loader',
            use: sassLoaders.slice(1)
        })
    }, {
        test: /\.css/,
        loader: _extractTextWebpackPlugin2.default.extract({
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
        }, {
            loader: 'image-webpack-loader',
            options: {
                bypassOnDebug: true
            }
        }]
    }, {
        test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'url-loader',
        options: _extends({
            limit: 10000
        }, fileLoaderOptions, {
            mimetype: "application/font-woff",
            outputPath: ASSET_FONT_OUTPUT,
            hash: 'sha512',
            digest: 'hex',
            name: '[hash:8].[ext]'
        })
    }, {
        test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'file-loader',
        options: _extends({}, fileLoaderOptions, {
            outputPath: ASSET_FONT_OUTPUT,
            hash: 'sha512',
            digest: 'hex',
            name: '[hash:8].[ext]'
        })
    }]);
    return _loaders;
};

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _extractTextWebpackPlugin = require('extract-text-webpack-plugin');

var _extractTextWebpackPlugin2 = _interopRequireDefault(_extractTextWebpackPlugin);

var _autoprefixer = require('autoprefixer');

var _autoprefixer2 = _interopRequireDefault(_autoprefixer);

var _postcssImport = require('postcss-import');

var _postcssImport2 = _interopRequireDefault(_postcssImport);

var _postcssUrl = require('postcss-url');

var _postcssUrl2 = _interopRequireDefault(_postcssUrl);

var _postcssSprites = require('postcss-sprites');

var _postcssSprites2 = _interopRequireDefault(_postcssSprites);

var _helper = require('../lib/helper');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var nodeModulesDir = _path2.default.join(__dirname, '..', 'node_modules');