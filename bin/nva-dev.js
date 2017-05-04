#! /usr/bin/env node

var program = require("commander")

program.option("-p, --port [value]", "dev server listen port")
program.parse(process.argv)

var port = program.port
var tasks = require('../packages/nva-task/src').default()
tasks.dev({ port })