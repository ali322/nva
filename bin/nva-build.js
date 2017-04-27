#! /usr/bin/env node

var program = require("commander")

program.option("-p, --profile","enable profile mode",false)
program.parse(process.argv)

var profile = program.profile

var tasks = require('nva-task')
tasks().build({profile})