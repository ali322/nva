#! /usr/bin/env node

var program = require("commander")
var hooks = require('../lib/hook')

program.option("-p, --port [value]", "dev server listen port")
program.option("-b, --browser [browser]", "which browser to open", 'default')
program.option("-P, --profile", "enable profile mode", false)
program.parse(process.argv)

var port = program.port
var browser = program.browser
var profile = program.profile

var tasks = require('nva-task')({hooks})
tasks.dev({ port, browser, profile })