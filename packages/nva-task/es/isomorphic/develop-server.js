'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (env, constants) {
    return function (options) {
        (0, _nodemon2.default)({
            // delay: "200ms",
            script: "app.js",
            execMap: {
                "js": "node_modules/.bin/babel-node"
            },
            verbose: false,
            stdout: false,
            // ignore: ["*"],
            watch: ["server"],
            ext: "js html json es6 jsx"
        }).on("readable", function () {
            this.stdout.on('data', function (chunk) {
                if (RUNNING_REGXP.test(chunk)) {
                    _browserSync2.default.reload({
                        stream: false
                    });
                }
                process.stdout.write(chunk);
            });
            // this.stdout.pipe(process.stdout);
            this.stderr.pipe(process.stderr);
        });

        var port = options.port;

        var _devPort = env.reloaderPort;
        _devPort = port || _devPort;
        var listenPort = process.env.LISTEN_PORT || 3000;
        var middleware = [(0, _mock2.default)()];
        if (integrated) {
            middleware = middleware.concat((0, _middleware2.default)((0, _lib.mergeConfig)((0, _webpack2.default)(env, constants))));
        }

        (0, _browserSync2.default)({
            proxy: {
                target: "http://localhost:" + listenPort,
                middleware: middleware
            },
            port: _devPort,
            files: "view/*.html",
            online: false,
            logLevel: "silent",
            notify: true,
            open: false,
            // reloadOnRestart:true,
            // browser: "google chrome",
            socket: {
                clientPath: "/bs"
            },
            scriptPath: function scriptPath(path) {
                path = path.replace(/browser-sync-client(\.\d+)+/, "browser-sync-client");
                return "http://localhost:" + _devPort + path;
            }
        }, function () {
            console.log('🚀  browser-sync is started at %d', _devPort);
        });
    };
};

var _browserSync = require('browser-sync');

var _browserSync2 = _interopRequireDefault(_browserSync);

var _nodemon = require('./nodemon');

var _nodemon2 = _interopRequireDefault(_nodemon);

var _mock = require('../base/mock');

var _mock2 = _interopRequireDefault(_mock);

var _lib = require('../lib');

var _middleware = require('../base/middleware');

var _middleware2 = _interopRequireDefault(_middleware);

var _webpack = require('./webpack.hot-update');

var _webpack2 = _interopRequireDefault(_webpack);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var RUNNING_REGXP = new RegExp(_lib.env.nvaConfig.runningMessage || 'server is running');
var integrated = _lib.env.nvaConfig.integrated || false;