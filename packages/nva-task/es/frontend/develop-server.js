'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (env, constants) {
    return function (options) {
        var browserSync = _browserSync2.default.create();
        var config = (0, _lib.mergeConfig)((0, _webpack2.default)(env, constants));
        var _middleware = (0, _middleware3.default)(config);
        var port = options.port;

        var _devPort = env.reloaderPort;
        _devPort = port || _devPort;

        var app = (0, _mock2.default)();
        app.get('/', function (req, res) {
            var htmlPath = _path2.default.join('.', env.sourcePath, env.pageFolder, 'index.html');
            if (_fsExtra2.default.existsSync(htmlPath)) {
                var html = _fsExtra2.default.readFileSync(htmlPath, 'utf8');
                res.send(html);
            } else {
                res.send('page not found');
            }
        });

        var _loop = function _loop(i) {
            var mod = env.modules[i];
            app.get('/' + mod.name + '*', function (req, res) {
                var htmlPath = _path2.default.join('.', env.sourcePath, env.pageFolder, mod.name + '.html');
                if (_fsExtra2.default.existsSync(htmlPath)) {
                    var html = _fsExtra2.default.readFileSync(htmlPath, 'utf8');
                    res.send(html);
                } else {
                    res.send('page not found');
                }
            });
        };

        for (var i in env.modules) {
            _loop(i);
        }

        process.once('SIGINT', function () {
            browserSync.exit();
            process.exit(0);
        });

        browserSync.init({
            port: _devPort,
            server: {
                baseDir: "."
            },
            middleware: _middleware.concat([app]),
            files: [_path2.default.join(env.pagePath, '*.html')],
            online: false,
            notify: true,
            open: false,
            watchOptions: {
                debounceDelay: 1000
            },
            ghostMode: {
                clicks: true,
                forms: true,
                scroll: true
            },
            logFileChanges: true,
            logConnections: false,
            logLevel: "silent",
            socket: {
                clientPath: "/bs"
            },
            scriptPath: function scriptPath(path) {
                path = path.replace(/browser-sync-client(\.\d+)+/, "browser-sync-client");
                return "http://localhost:" + _devPort + path;
            }
        }, function () {
            console.log('🌎  develop server started at %d', _devPort);
        });
    };
};

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _mock = require('../base/mock');

var _mock2 = _interopRequireDefault(_mock);

var _lib = require('../lib');

var _middleware2 = require('../base/middleware');

var _middleware3 = _interopRequireDefault(_middleware2);

var _webpack = require('./webpack.hot-update');

var _webpack2 = _interopRequireDefault(_webpack);

var _browserSync = require('browser-sync');

var _browserSync2 = _interopRequireDefault(_browserSync);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }