'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (config) {
    var bundler = (0, _webpack2.default)(config);
    return [(0, _webpackDevMiddleware2.default)(bundler, {
        publicPath: config.output.publicPath,
        stats: {
            colors: true
        },
        hot: true,
        noInfo: true,
        lazy: false,
        watchOptions: {
            aggregateTimeout: 300,
            poll: true,
            ignored: [/node_modules/]
        },
        quiet: false
    }), (0, _webpackHotMiddleware2.default)(bundler, { log: false })];
};

var _webpack = require('webpack');

var _webpack2 = _interopRequireDefault(_webpack);

var _webpackDevMiddleware = require('webpack-dev-middleware');

var _webpackDevMiddleware2 = _interopRequireDefault(_webpackDevMiddleware);

var _webpackHotMiddleware = require('webpack-hot-middleware');

var _webpackHotMiddleware2 = _interopRequireDefault(_webpackHotMiddleware);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = exports['default'];