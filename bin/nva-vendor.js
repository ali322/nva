#! /usr/bin/env node

var hooks = require('../lib/hook')
var tasks = require('nva-task')({hooks})
tasks.vendor()