'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.happypackPlugins = exports.DEBUG = exports.env = undefined;
exports.happypackPlugin = happypackPlugin;
exports.mergeConfig = mergeConfig;

var _happypack = require('happypack');

var _happypack2 = _interopRequireDefault(_happypack);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _lodash = require('lodash');

var _webpackMerge = require('webpack-merge');

var _webpackMerge2 = _interopRequireDefault(_webpackMerge);

var _environment = require('./environment');

var _environment2 = _interopRequireDefault(_environment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

exports.env = _environment2.default;
var DEBUG = exports.DEBUG = process.env.NODE_ENV !== 'production';

function happypackPlugin(id, loaders) {
    var compilerThreadPool = _happypack2.default.ThreadPool({ size: _os2.default.cpus().length });
    return new _happypack2.default({
        id: id,
        tempDir: _path2.default.join('.nva', 'temp', 'happypack'),
        verbose: false,
        threadPool: compilerThreadPool,
        loaders: loaders
    });
}

var happypackPlugins = exports.happypackPlugins = [happypackPlugin('js', [{ loader: 'babel-loader', options: { cacheDirectory: true } }]), happypackPlugin('less', ['less-loader']), happypackPlugin('sass', ['sass-loader']), happypackPlugin('stylus', ['stylus-loader'])];

function mergeConfig(config) {
    var webpackConfig = Array.isArray(_environment2.default.webpackConfig) ? _environment2.default.webpackConfig : [_environment2.default.webpackConfig];
    if (Array.isArray(config)) {
        return config.map(function (v) {
            if (v.name) {
                return (0, _webpackMerge2.default)(v, (0, _lodash.find)(webpackConfig, { name: v.name }));
            }
            return _webpackMerge2.default.apply(undefined, [v].concat(_toConsumableArray(webpackConfig)));
        });
    }
    if (config.name) {
        return (0, _webpackMerge2.default)(config, (0, _lodash.find)(webpackConfig, { name: config.name }));
    }
    return _webpackMerge2.default.apply(undefined, [config].concat(_toConsumableArray(webpackConfig)));
}