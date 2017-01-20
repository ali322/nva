#! /usr/bin/env node

var program = require("commander")
var chalk = require("chalk")
var lib = require('../lib')

program.option("-s, --source [value]","define source path")
program.option("-d, --dest [value]","define dest path")
program.parse(process.argv)

const options = program.rawArgs.slice(3)
lib.interceptOptions(options,['-s','-d'])

var source = program.source
var dest = program.dest
var tasks = require('../nva-task')
tasks.build({source,dest})