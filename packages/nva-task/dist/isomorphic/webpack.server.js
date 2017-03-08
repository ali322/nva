'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (env) {
    var nodeModules = {};
    _fs2.default.readdirSync('node_modules').filter(function (x) {
        return ['.bin'].indexOf(x) === -1;
    }).forEach(function (mod) {
        nodeModules[mod] = 'commonjs ' + mod;
    });
    return {
        name: 'server',
        entry: ['babel-polyfill', _path2.default.join(process.cwd(), env.serverFolder, env.serverEntryJS)],
        target: 'node',
        node: {
            __dirname: true,
            __filename: true
        },
        output: {
            path: _path2.default.join(process.cwd(), env.serverFolder, env.distFolder),
            filename: env.serverEntryJS,
            libraryTarget: 'commonjs2'
        },
        module: {
            rules: [{
                test: /\.(es6|jsx|js)$/,
                exclude: [nodeModulesDir],
                loader: 'happypack/loader',
                options: {
                    id: 'js'
                }
            }]
        },
        context: __dirname,
        resolve: { modules: [env.serverFolder, _path2.default.join(process.cwd(), "node_modules")] },
        externals: nodeModules,
        plugins: [new _progressBarWebpackPlugin2.default({
            format: 'Building server [:bar] ' + _chalk2.default.green.bold(':percent'),
            clear: false,
            summary: false
        }), new _webpack2.default.IgnorePlugin(/\.(css|less)$/), new _webpack2.default.BannerPlugin({ banner: 'require("source-map-support").install();', raw: true, entryOnly: false })].concat(_toConsumableArray(_lib.happypackPlugins)),
        devtool: 'sourcemap'
    };
};

var _webpack = require('webpack');

var _webpack2 = _interopRequireDefault(_webpack);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _progressBarWebpackPlugin = require('progress-bar-webpack-plugin');

var _progressBarWebpackPlugin2 = _interopRequireDefault(_progressBarWebpackPlugin);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _lib = require('../lib');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var nodeModulesDir = _path2.default.join(__dirname, '..', 'node_modules');

module.exports = exports['default'];