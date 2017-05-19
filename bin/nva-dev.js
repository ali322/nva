#! /usr/bin/env node

var program = require("commander")

program.option("-p, --port [value]", "dev server listen port")
program.option("-b, --browser [browser]", "which browser to open", 'default')
program.parse(process.argv)

var port = program.port
var browser = program.browser

var tasks = require('nva-task')()
tasks.dev({ port, browser })