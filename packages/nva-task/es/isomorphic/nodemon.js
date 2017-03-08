'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (options) {
    var script = (0, _nodemon2.default)(options),
        started = false;

    var exitHanlder = function exitHanlder(options) {
        if (options.exit) script.emit('exit');
        if (options.quit) process.exit(0);
    };

    process.once('exit', exitHanlder.bind(null, { exit: true }));
    process.once('SIGINT', exitHanlder.bind(null, { quit: true }));

    script.on('log', function (log) {
        // nodemonLog(log.colour)
    });

    script.on('start', function () {
        if (!started) {
            return;
        }
        started = true;
    });

    return script;
};

var _nodemon = require('nodemon');

var _nodemon2 = _interopRequireDefault(_nodemon);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function nodemonLog(message) {
    var time = new Date().toString().split(' ')[4];
    console.log(_chalk2.default.yellow('[' + time + ']' + message));
}