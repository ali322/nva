#! /usr/bin/env node

var program = require("commander")
var hooks = require('../lib/hook')

program.option("-p, --profile","enable profile mode",false)
program.parse(process.argv)

var profile = program.profile

var tasks = require('nva-task')({hooks})
tasks.build({profile})