'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = function (env, constants) {
    var VENDOR_OUTPUT = constants.VENDOR_OUTPUT,
        MANIFEST_PATH = constants.MANIFEST_PATH;

    var baseConfig = (0, _config2.default)(_extends({}, constants, { HOT: false }));

    var entryJS = {},
        entryCSS = {},
        vendorCSSChunks = [];
    for (var key in env.vendors['js']) {
        entryJS[key] = env.vendors['js'][key];
    }
    for (var _key in env.vendors['css']) {
        vendorCSSChunks.push(_key);
        entryCSS[_key] = env.vendors['css'][_key];
    }

    var vendorJSConfig = _extends({}, baseConfig, {
        name: "vendor:js",
        entry: entryJS,
        output: {
            path: VENDOR_OUTPUT,
            filename: '[name]-[chunkhash:8].js',
            library: '[name]_[hash]'
        },
        context: __dirname,
        resolve: { modules: [env.sourcePath, _path2.default.join(process.cwd(), "node_modules")] },
        plugins: [].concat(_toConsumableArray(baseConfig.plugins.slice(1)), [new _progressBarWebpackPlugin2.default({
            format: 'Building vendor:js [:bar] ' + _chalk2.default.green.bold(':percent'),
            clear: false,
            summary: false
        }), new _webpack2.default.DllPlugin({
            name: '[name]_[hash]',
            path: _path2.default.resolve(_path2.default.join(MANIFEST_PATH, '[name]-manifest.json')),
            context: __dirname
        })])
    });

    var vendorCSSConfig = _extends({}, baseConfig, {
        name: "vendor:css",
        entry: entryCSS,
        context: __dirname,
        resolve: { modules: [env.sourcePath, _path2.default.join(process.cwd(), "node_modules")] },
        output: {
            path: constants.OUTPUT_PATH
        },
        plugins: [].concat(_toConsumableArray(baseConfig.plugins.slice(1)), [new _progressBarWebpackPlugin2.default({
            format: 'Building vendor:css [:bar] ' + _chalk2.default.green.bold(':percent'),
            clear: false,
            summary: false
        }), new _extractTextWebpackPlugin2.default(_path2.default.join(env.distFolder, "[name]", "[name]-[hash:8].css")), new _chunkTransformWebpackPlugin2.default({
            chunks: vendorCSSChunks,
            test: /\.css/,
            filename: function filename(_filename) {
                return _path2.default.join(env.distFolder, env.vendorFolder, _path2.default.basename(_filename));
            }
        })])
    });

    return [vendorJSConfig, vendorCSSConfig];
};

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _webpack = require('webpack');

var _webpack2 = _interopRequireDefault(_webpack);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _extractTextWebpackPlugin = require('extract-text-webpack-plugin');

var _extractTextWebpackPlugin2 = _interopRequireDefault(_extractTextWebpackPlugin);

var _chunkTransformWebpackPlugin = require('chunk-transform-webpack-plugin');

var _chunkTransformWebpackPlugin2 = _interopRequireDefault(_chunkTransformWebpackPlugin);

var _progressBarWebpackPlugin = require('progress-bar-webpack-plugin');

var _progressBarWebpackPlugin2 = _interopRequireDefault(_progressBarWebpackPlugin);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

module.exports = exports['default'];