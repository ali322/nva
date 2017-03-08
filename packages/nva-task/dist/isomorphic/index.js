'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.developServer = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.removeModule = removeModule;
exports.addModule = addModule;
exports.build = build;
exports.vendor = vendor;

var _webpack = require('webpack');

var _webpack2 = _interopRequireDefault(_webpack);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _del = require('del');

var _del2 = _interopRequireDefault(_del);

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _lib = require('../lib');

var _helper = require('../lib/helper');

var _vendor = require('../base/vendor');

var _vendor2 = _interopRequireDefault(_vendor);

var _webpack3 = require('./webpack.server');

var _webpack4 = _interopRequireDefault(_webpack3);

var _webpack5 = require('./webpack.client');

var _webpack6 = _interopRequireDefault(_webpack5);

var _developServer = require('./develop-server');

var _developServer2 = _interopRequireDefault(_developServer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function callback(info, err, stats) {
    if (err || stats.hasErrors()) {
        console.log(_chalk2.default.red(err, stats));
        return;
    }
    console.log('😌  ' + info);
    console.log(stats.toString({
        chunks: false,
        version: false,
        colors: true
    }));
}

var constants = {
    OUTPUT_PATH: _path2.default.resolve(_path2.default.join(process.cwd(), _lib.env.clientPath)),
    ASSET_IMAGE_OUTPUT: _path2.default.join(_lib.env.distFolder, _lib.env.assetFolder, _lib.env.imageFolder, _path2.default.sep),
    ASSET_FONT_OUTPUT: _path2.default.join(_lib.env.distFolder, _lib.env.assetFolder, _lib.env.fontFolder, _path2.default.sep),
    SPRITE_OUTPUT: _path2.default.join(_lib.env.clientPath, _lib.env.assetFolder, _lib.env.spriteFolder),
    ASSET_INPUT: _path2.default.join(_lib.env.clientPath, _lib.env.assetFolder),
    IMAGE_PREFIX: _path2.default.join('..', '..', '..', _lib.env.distFolder, _lib.env.assetFolder, _lib.env.imageFolder),
    FONT_PREFIX: _path2.default.join('..', '..', _lib.env.distFolder, _lib.env.assetFolder, _lib.env.fontFolder),
    VENDOR_OUTPUT: _path2.default.join(_lib.env.clientPath, _lib.env.distFolder, _lib.env.vendorFolder),
    MANIFEST_PATH: _path2.default.join(_lib.env.clientPath, _lib.env.distFolder, _lib.env.vendorFolder),
    DEBUG: _lib.DEBUG
};

function removeModule(name) {
    var _moduleConfig = _extends({}, _lib.env.moduleConfig);
    var names = name.split(',');
    names.forEach(function (_name) {
        if (_moduleConfig[_name]) {
            delete _moduleConfig[_name];
        }
        (0, _helper.writeToModuleConfig)(_moduleConfig);
        var _html = _path2.default.join(_lib.env.pagePath, _name + '.html'),
            _client = _path2.default.join(_lib.env.clientPath, _lib.env.bundleFolder, _name);
        if (_fsExtra2.default.existsSync(_html)) {
            _fsExtra2.default.removeSync(_html);
        } else {
            console.log(_chalk2.default.red('htmls of module \'' + _name + '\' not existed,maybe module \'' + _name + '\' have been removed?'));
            return;
        }
        if (_fsExtra2.default.existsSync(_client)) {
            _fsExtra2.default.removeSync(_client);
        } else {
            console.log(_chalk2.default.red('client bundle of module \'' + _name + '\' not existed,maybe module \'' + _name + '\' have been removed?'));
            return;
        }
    });
}

function addModule(name, config, templateModule) {
    var _moduleConfig = _extends({}, _lib.env.moduleConfig);
    var names = name.split(',');
    var _template = templateModule || false;
    if (_template) {
        _template = typeof _template === 'string' ? _template : 'index';
    }
    names.forEach(function (_name) {
        _moduleConfig[_name] = {
            name: _name,
            path: config.path || _name,
            html: config.html ? config.html.spit(',') : [_name + '.html']
        };
        (0, _helper.writeToModuleConfig)(_moduleConfig);
        var _html = _template ? _path2.default.join(_lib.env.pagePath, _template + '.html') : '',
            _client = _template ? _path2.default.join(_lib.env.clientPath, _lib.env.bundleFolder, _template) : '';
        if (_fsExtra2.default.existsSync(_html)) {
            _fsExtra2.default.copySync(_html, _path2.default.join(_lib.env.pagePath, _name + '.html'));
        } else {
            _fsExtra2.default.ensureFileSync(_path2.default.join(_lib.env.pagePath, _name + '.html'));
        }
        if (_fsExtra2.default.existsSync(_client)) {
            _fsExtra2.default.copySync(_client, _path2.default.join(_lib.env.clientPath, _lib.env.bundleFolder, _name));
        } else {
            _fsExtra2.default.ensureFileSync(_path2.default.join(_lib.env.clientPath, _lib.env.bundleFolder, _name, _name + '.js'));
            _fsExtra2.default.ensureFileSync(_path2.default.join(_lib.env.clientPath, _lib.env.bundleFolder, _name, _name + '.css'));
        }
    });
}

function build() {
    var serverConfig = (0, _webpack4.default)(_lib.env);
    var clientConfig = (0, _lib.mergeConfig)((0, _webpack6.default)(_lib.env, constants));
    _del2.default.sync(_path2.default.join('server', _lib.env.distFolder));
    /** clean dist */
    // del.sync([path.join(env.clientPath, env.distFolder, env.assetFolder)])
    _lib.env.modules.forEach(function (moduleObj) {
        _del2.default.sync(_path2.default.join(_lib.env.clientPath, _lib.env.distFolder, moduleObj.path, '/*.*'));
    });
    var compiler = (0, _webpack2.default)([clientConfig, serverConfig]);
    compiler.run(function (err, stats) {
        callback('build success!', err, stats);
    });
}

function vendor() {
    var vendorConfig = (0, _lib.mergeConfig)((0, _vendor2.default)(_lib.env, constants));
    console.log('vendorConfig', vendorConfig);
    _del2.default.sync([_path2.default.join(_lib.env.clientPath, _lib.env.distFolder, _lib.env.vendorFolder, '*.*')]);
    var compiler = (0, _webpack2.default)(vendorConfig);
    compiler.run(function (err, stats) {
        callback('build vendor success!', err, stats);
    });
}

var developServer = exports.developServer = (0, _developServer2.default)(_lib.env, constants);