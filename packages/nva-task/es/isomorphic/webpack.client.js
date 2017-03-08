'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = function (env, constants) {
    /** build variables*/
    var entry = {};
    var htmls = [];
    var baseConfig = (0, _config2.default)(_extends({}, constants, { HOT: false }));

    /** add vendors reference*/
    var dllRefs = [];
    var vendors = [];
    vendors = _glob2.default.sync('*.{js,css}', {
        cwd: _path2.default.join(process.cwd(), env.clientPath, env.distFolder, env.vendorFolder)
    });
    for (var key in env.vendors['js']) {
        var manifestPath = _path2.default.join(process.cwd(), env.clientPath, env.distFolder, env.vendorFolder, key + '-manifest.json');
        (0, _helper.checkManifest)(manifestPath);
        var _manifest = require(manifestPath);
        dllRefs.push(new _webpack2.default.DllReferencePlugin({
            context: _path2.default.resolve(env.clientPath),
            manifest: _manifest
        }));
    }

    /** build modules*/
    env.modules.forEach(function (moduleObj) {
        entry[moduleObj.name] = [moduleObj.entryJS, moduleObj.entryCSS];
        var _chunks = [moduleObj.name];
        var _more = { js: [], css: [] };
        if (moduleObj.vendor) {
            if (moduleObj.vendor.js) {
                _more.js = vendors.filter(function (v) {
                    var _regexp = new RegExp(moduleObj.vendor.js + "-\\w+\\.js$");
                    return _regexp.test(v);
                }).map(function (v) {
                    return _path2.default.join(_path2.default.sep, env.distFolder, env.vendorFolder, v);
                });
                _more.css = vendors.filter(function (v) {
                    var _regexp = new RegExp(moduleObj.vendor.css + "-\\w+\\.css$");
                    return _regexp.test(v);
                }).map(function (v) {
                    return _path2.default.join(_path2.default.sep, env.distFolder, env.vendorFolder, v);
                });
            }
        }
        moduleObj.html.forEach(function (html) {
            htmls.push(new _injectHtmlWebpackPlugin2.default({
                processor: _path2.default.sep,
                chunks: _chunks,
                filename: html,
                more: _more,
                customInject: [{
                    start: '<!-- start:bundle-time -->',
                    end: '<!-- end:bundle-time -->',
                    content: (0, _helper.bundleTime)()
                }, {
                    start: '<!-- start:browser-sync -->',
                    end: '<!-- end:browser-sync -->',
                    content: ''
                }]
            }));
        });
    });

    return _extends({}, baseConfig, {
        name: 'client',
        entry: entry,
        output: {
            path: constants.OUTPUT_PATH,
            filename: _path2.default.join(env.distFolder, "[name]", "[name]-[hash:8].js"),
            chunkFilename: _path2.default.join(env.distFolder, "[name]", "[id]-[hash:8].chunk.js")
        },
        context: __dirname,
        resolve: { modules: [env.clientPath, _path2.default.join(process.cwd(), "node_modules")] },
        plugins: [].concat(_toConsumableArray(baseConfig.plugins.slice(1)), [new _progressBarWebpackPlugin2.default({
            format: 'Building client [:bar] ' + _chalk2.default.green.bold(':percent'),
            clear: false,
            summary: false
        }), new _extractTextWebpackPlugin2.default({ filename: _path2.default.join(env.distFolder, "[name]", "[name]-[contenthash:8].css"), allChunks: true })], dllRefs, htmls)
    });
};

var _webpack = require('webpack');

var _webpack2 = _interopRequireDefault(_webpack);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _extractTextWebpackPlugin = require('extract-text-webpack-plugin');

var _extractTextWebpackPlugin2 = _interopRequireDefault(_extractTextWebpackPlugin);

var _injectHtmlWebpackPlugin = require('inject-html-webpack-plugin');

var _injectHtmlWebpackPlugin2 = _interopRequireDefault(_injectHtmlWebpackPlugin);

var _progressBarWebpackPlugin = require('progress-bar-webpack-plugin');

var _progressBarWebpackPlugin2 = _interopRequireDefault(_progressBarWebpackPlugin);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _helper = require('../lib/helper');

var _config = require('../base/config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }