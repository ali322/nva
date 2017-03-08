'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = function (env, constants) {
    /** build variables*/
    var entry = {};
    var htmls = [],
        copys = [];
    var baseConfig = (0, _config2.default)(_extends({}, constants, { HOT: false }));

    /** build vendors*/
    var dllRefs = [];
    var vendors = [];
    vendors = _glob2.default.sync('*.{js,css}', {
        cwd: _path2.default.join(process.cwd(), env.distFolder, env.vendorFolder)
    });
    for (var key in env.vendors['js']) {
        var manifestPath = _path2.default.join(process.cwd(), env.distFolder, env.vendorFolder, key + '-manifest.json');
        (0, _helper.checkManifest)(manifestPath);
        var _manifest = require(manifestPath);
        dllRefs.push(new _webpack2.default.DllReferencePlugin({
            context: __dirname,
            manifest: _manifest
        }));
    }

    env.modules.forEach(function (moduleObj) {
        entry[moduleObj.name] = [moduleObj.entryJS, moduleObj.entryCSS];
        var _chunks = [moduleObj.name];
        var _more = { js: [], css: [] };
        if (moduleObj.vendor) {
            if (moduleObj.vendor.js) {
                _more.js = vendors.filter(function (v) {
                    var _regexpJS = new RegExp(moduleObj.vendor.js + "-\\w+\\.js$");
                    return _regexpJS.test(v);
                }).map(function (v) {
                    return _path2.default.join('..', env.vendorFolder, v);
                });
                _more.css = vendors.filter(function (v) {
                    var _regexpCSS = new RegExp(moduleObj.vendor.css + "-\\w+\\.css$");
                    return _regexpCSS.test(v);
                }).map(function (v) {
                    return _path2.default.join('..', env.vendorFolder, v);
                });
            }
        }
        moduleObj.html.forEach(function (html) {
            htmls.push(new _injectHtmlWebpackPlugin2.default({
                processor: function processor(_url) {
                    var _urls = _url.split(_path2.default.sep);
                    return _urls.indexOf(env.vendorFolder) > -1 ? _url : _urls.slice(-1)[0];
                },
                more: _more,
                chunks: _chunks,
                filename: html,
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
            copys.push({
                from: html,
                to: _path2.default.join(env.distFolder, moduleObj.name, _path2.default.basename(html)),
                context: process.cwd()
            });
        });
    });

    return _extends({}, baseConfig, {
        entry: entry,
        output: {
            path: constants.OUTPUT_PATH,
            filename: _path2.default.join(env.distFolder, "[name]", "[name]-[hash:8].js"),
            chunkFilename: _path2.default.join(env.distFolder, "[name]", "[id]-[hash:8].chunk.js")
        },
        context: __dirname,
        resolve: { modules: [env.sourcePath, _path2.default.join(process.cwd(), "node_modules")] },
        plugins: [].concat(_toConsumableArray(baseConfig.plugins), [new _extractTextWebpackPlugin2.default(_path2.default.join(env.distFolder, "[name]", "[name]-[hash:8].css"))], dllRefs, htmls, [new _copyWebpackPlugin2.default(copys, { copyUnmodified: true })])
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

var _copyWebpackPlugin = require('copy-webpack-plugin');

var _copyWebpackPlugin2 = _interopRequireDefault(_copyWebpackPlugin);

var _config = require('../base/config');

var _config2 = _interopRequireDefault(_config);

var _helper = require('../lib/helper');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }