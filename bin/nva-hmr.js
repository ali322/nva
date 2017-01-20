#! /usr/bin/env node

var program = require("commander")
var chalk = require("chalk")
var lib = require("../lib")

program.option("-p, --port [value]","hmr server listen port")
program.parse(process.argv)

const options = program.rawArgs.slice(3)
lib.interceptOptions(options,['-p'])

var port = program.port
var tasks = require('nva-task')
tasks.hmrServer({port})