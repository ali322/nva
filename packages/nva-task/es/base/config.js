'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = function (constants) {
    var config = {
        module: {
            rules: (0, _loaders2.default)(constants)
        },
        resolve: {
            extensions: [".js", ".json", ".es6", ".jsx", ".styl", ".css", ".less", '.scss']
        }
    };

    var plugins = [new _progressBarWebpackPlugin2.default({
        format: 'Building [:bar] ' + _chalk2.default.green.bold(':percent'),
        clear: false,
        summary: false
    }), new _webpack2.default.LoaderOptionsPlugin({
        options: {
            context: __dirname
        }
    })].concat(_toConsumableArray(_lib.happypackPlugins));

    var restConfig = constants.HOT ? {
        devtool: "#inline-source-map",
        watch: true,
        performance: { hints: false },
        plugins: [].concat(_toConsumableArray(plugins), [new _webpack2.default.HotModuleReplacementPlugin(), new _friendlyErrorsWebpackPlugin2.default({ clearConsole: false }), new _webpack2.default.NoEmitOnErrorsPlugin()])
    } : {
        devtool: false,
        plugins: [].concat(_toConsumableArray(plugins), [new _webpack2.default.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production')
        }), new _webpack2.default.optimize.UglifyJsPlugin({
            comments: false,
            sourceMap: false,
            output: {
                comments: false
            }
        })])
    };
    return _extends({}, config, restConfig);
};

var _webpack = require('webpack');

var _webpack2 = _interopRequireDefault(_webpack);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _friendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');

var _friendlyErrorsWebpackPlugin2 = _interopRequireDefault(_friendlyErrorsWebpackPlugin);

var _progressBarWebpackPlugin = require('progress-bar-webpack-plugin');

var _progressBarWebpackPlugin2 = _interopRequireDefault(_progressBarWebpackPlugin);

var _loaders = require('./loaders');

var _loaders2 = _interopRequireDefault(_loaders);

var _lib = require('../lib');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }