'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _helper = require('./helper');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var moduleConfig = (0, _helper.moduleConfig)();
var vendorConfig = (0, _helper.vendorConfig)();
var webpackConfig = (0, _helper.webpackConfig)();
var nvaConfig = (0, _helper.nvaConfig)();
var nvaType = nvaConfig['type'];

var env = {
    entryJSExt: '.js',
    entryCSSExt: '.css',
    buildFolder: "build",
    distFolder: "dist",
    bundleFolder: "bundle",
    vendorFolder: "vendor",

    assetFolder: 'asset',
    cssFolder: '',
    spriteFolder: 'sprites',
    fontFolder: 'font',
    imageFolder: 'image',

    sourcePath: "src",
    clientPath: "",
    pageFolder: "page",
    hmrPath: "/hmr/",
    moduleConfig: moduleConfig,
    nvaConfig: nvaConfig
};
env.pagePath = _path2.default.join(env.sourcePath, env.pageFolder);
env.lanIP = (0, _helper.getLanIP)();
env.reloaderPort = process.env.RELOADER_PORT || 7000;
env.hmrPort = process.env.HMR_PORT || 5000;
env.reloaderHost = "http://" + env.lanIP + ":" + env.reloaderPort;

var _sourcePath = env.sourcePath;
if (nvaType === 'isomorphic') {
    env = _extends({}, env, {
        pagePath: 'view',
        cssFolder: 'stylesheet',
        moduleFolder: 'module',
        serverFolder: 'server',
        serverEntryJS: 'bootstrap.js',
        clientPath: "client",
        entryJSExt: '.jsx'
    });
    _sourcePath = env.clientPath;
}

delete nvaConfig['type'];

env = _extends({}, env, nvaConfig);

var modules = [];
if (moduleConfig) {
    for (var moduleName in moduleConfig) {
        var moduleObj = moduleConfig[moduleName];
        var entryJS = moduleObj.entryJS || moduleName + env.entryJSExt;
        var entryCSS = moduleObj.entryCSS || moduleName + env.entryCSSExt;
        var entryHtml = [];

        entryJS = _path2.default.resolve(_path2.default.join(_sourcePath, env.bundleFolder, moduleObj.path, entryJS));
        entryCSS = _path2.default.resolve(_path2.default.join(_sourcePath, env.bundleFolder, moduleObj.path, entryCSS));
        if (typeof moduleObj.html === 'string') {
            entryHtml = [_path2.default.join(env.pagePath, moduleObj.html)];
        } else if (Array.isArray(moduleObj.html)) {
            entryHtml = moduleObj.html.map(function (v) {
                return _path2.default.join(env.pagePath, v);
            });
        }
        modules.push(_extends({}, moduleObj, {
            name: moduleName,
            entryCSS: entryCSS,
            entryJS: entryJS,
            html: entryHtml
        }));
    }
}

env.modules = modules;
env.vendors = vendorConfig;
env.webpackConfig = webpackConfig;

exports.default = env;