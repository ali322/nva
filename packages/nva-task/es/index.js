"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _frontend = require("./frontend");

var frontend = _interopRequireWildcard(_frontend);

var _isomorphic = require("./isomorphic");

var isomorphic = _interopRequireWildcard(_isomorphic);

var _helper = require("./lib/helper");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var nvaType = (0, _helper.nvaConfig)()["type"];
var tasks = nvaType === 'isomorphic' ? isomorphic : frontend;

exports.default = tasks;