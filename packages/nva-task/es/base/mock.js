'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function () {
    _jsonSchemaFaker2.default.extend('faker', function () {
        var faker = require('faker/locale/en_US');
        return faker;
    });
    var app = (0, _express2.default)();
    var router = _express2.default.Router();
    var _apis = _glob2.default.sync('*.json', { cwd: _path2.default.resolve(process.cwd(), '.nva', 'api') });
    _apis.map(function (v) {
        return _fsExtra2.default.readJsonSync(_path2.default.resolve(process.cwd(), '.nva', 'api', v));
    }).forEach(function (v) {
        v.forEach(function (rule) {
            if ([].indexOf.call(['get', 'post', 'put', 'delete', 'head', 'patch'], rule.method) === -1) {
                throw new Error('method invalid!');
            }
            app[rule.method](rule.url, function (req, res, next) {
                res.status(200).json(rule.response.type ? (0, _jsonSchemaFaker2.default)(rule.response) : rule.response);
            });
        });
    });
    router.all('*', function (req, res) {
        res.status(404).end();
    });
    app.use(function (err, req, res, next) {
        res.status(500).send({ err: err });
    });
    return app;
};

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _jsonSchemaFaker = require('json-schema-faker');

var _jsonSchemaFaker2 = _interopRequireDefault(_jsonSchemaFaker);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }