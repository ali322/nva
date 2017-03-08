'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = function (env, constants) {
    /** build variables*/
    var entry = {};
    var htmls = [];
    var RELOADER_HOST = env.reloaderHost;
    var baseConfig = (0, _config2.default)(_extends({}, constants, { HOT: true }));

    /*build vendors*/
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

    /** build modules */
    env.modules.forEach(function (moduleObj) {
        entry[moduleObj.name] = ["webpack-hot-middleware/client", moduleObj.entryJS, moduleObj.entryCSS];
        var _chunks = [moduleObj.name];
        var _more = { js: [], css: [] };
        if (moduleObj.vendor) {
            if (moduleObj.vendor.js) {
                _more.js = vendors.filter(function (v) {
                    var _regexpJS = new RegExp(moduleObj.vendor.js + "-\\w+\\.js$");
                    return _regexpJS.test(v);
                }).map(function (v) {
                    return _path2.default.join(_path2.default.sep, env.distFolder, env.vendorFolder, v);
                });
                _more.css = vendors.filter(function (v) {
                    var _regexpCSS = new RegExp(moduleObj.vendor.css + "-\\w+\\.css$");
                    return _regexpCSS.test(v);
                }).map(function (v) {
                    return _path2.default.join(_path2.default.sep, env.distFolder, env.vendorFolder, v);
                });
            }
        }
        moduleObj.html.forEach(function (html) {
            htmls.push(new _injectHtmlWebpackPlugin2.default({
                processor: env.hmrPath,
                chunks: _chunks,
                filename: html,
                more: _more,
                customInject: [{
                    start: '<!-- start:browser-sync -->',
                    end: '<!-- end:browser-sync -->',
                    content: '<script src="' + RELOADER_HOST + '/bs/browser-sync-client.js"></script>'
                }]
            }));
        });
    });

    return _extends({}, baseConfig, {
        entry: entry,
        output: {
            path: constants.OUTPUT_PATH,
            filename: _path2.default.join("[name]", "[name].js"),
            chunkFilename: _path2.default.join("[name]", "[id].chunk.js"),
            publicPath: env.hmrPath
        },
        context: __dirname,
        resolve: { modules: [env.sourcePath, _path2.default.join(process.cwd(), "node_modules"), "node_modules"] },
        plugins: [].concat(_toConsumableArray(baseConfig.plugins), dllRefs, htmls)
    });
};

var _webpack = require('webpack');

var _webpack2 = _interopRequireDefault(_webpack);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _injectHtmlWebpackPlugin = require('inject-html-webpack-plugin');

var _injectHtmlWebpackPlugin2 = _interopRequireDefault(_injectHtmlWebpackPlugin);

var _config = require('../base/config');

var _config2 = _interopRequireDefault(_config);

var _helper = require('../lib/helper');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

process.traceDeprecation = true;

module.exports = exports['default'];