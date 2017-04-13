#! /usr/bin/env node

var program = require("commander")

program.option("-p, --port [value]","dev server listen port")
program.parse(process.argv)

var port = program.port
var tasks = require('nva-task')
tasks.developServer({port})