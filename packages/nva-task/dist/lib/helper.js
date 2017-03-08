'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getLanIP = getLanIP;
exports.bundleTime = bundleTime;
exports.urlResolver = urlResolver;
exports.nvaConfig = nvaConfig;
exports.moduleConfig = moduleConfig;
exports.writeToModuleConfig = writeToModuleConfig;
exports.vendorConfig = vendorConfig;
exports.webpackConfig = webpackConfig;
exports.checkManifest = checkManifest;

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var NVA_PATH = '.nva';
var MODULE_CONFIG_FILE = _path2.default.join(process.cwd(), NVA_PATH, 'module.json');
var NVA_CONFIG_FILE = _path2.default.join(process.cwd(), NVA_PATH, 'nva.json');
var VENDOR_CONFIG_FILE = _path2.default.join(process.cwd(), NVA_PATH, 'vendor.json');
var WEBPACK_CONFIG_FILE = _path2.default.join(process.cwd(), NVA_PATH, 'webpack.config.js');

function getLanIP() {
    var interfaces = _os2.default.networkInterfaces();
    var IPv4 = '127.0.0.1';

    var _loop = function _loop(key) {
        interfaces[key].forEach(function (details) {
            if (details.family == 'IPv4' && /^en\d{1}$/.test(key) === true) {
                IPv4 = details.address;
            }
        });
    };

    for (var key in interfaces) {
        _loop(key);
    }
    return IPv4;
}

function bundleTime() {
    var dateObj = new Date();
    var year = dateObj.getFullYear();
    var month = dateObj.getMonth() + 1;
    var date = dateObj.getDate();
    var hour = dateObj.getHours();
    var minute = dateObj.getMinutes();
    return "" + year + month + date + hour + minute;
}

function urlResolver(originURL, from, to, input) {
    var _url = _path2.default.join(_path2.default.relative(from, input), originURL);
    if (/node_modules/.test(from)) {
        _url = originURL;
    }
    return _url;
}

function nvaConfig() {
    var nvaConfig = void 0;
    _fs2.default.existsSync(NVA_CONFIG_FILE) && (nvaConfig = JSON.parse(_fs2.default.readFileSync(NVA_CONFIG_FILE, 'utf8')));
    return nvaConfig;
}

function moduleConfig() {
    var moduleConfig = void 0;
    _fs2.default.existsSync(MODULE_CONFIG_FILE) && (moduleConfig = JSON.parse(_fs2.default.readFileSync(MODULE_CONFIG_FILE, 'utf8')));
    return moduleConfig;
}

function writeToModuleConfig(config) {
    try {
        _fs2.default.existsSync(MODULE_CONFIG_FILE) && _fs2.default.writeFileSync(MODULE_CONFIG_FILE, JSON.stringify(config, null, 2));
    } catch (e) {
        return false;
    }
    return true;
}

function vendorConfig() {
    var vendorConfig = void 0;
    _fs2.default.existsSync(VENDOR_CONFIG_FILE) && (vendorConfig = JSON.parse(_fs2.default.readFileSync(VENDOR_CONFIG_FILE, 'utf8')));
    return vendorConfig;
}

function webpackConfig() {
    var webpackConfig = {};
    _fs2.default.existsSync(WEBPACK_CONFIG_FILE) && (webpackConfig = require(WEBPACK_CONFIG_FILE));
    return webpackConfig;
}

function checkManifest(path) {
    if (!_fs2.default.existsSync(path)) {
        console.log(_chalk2.default.red('vendor manifest not found,did you forget run `nva vendor`?'));
        process.exit(1);
    }
}