#! /usr/bin/env node

var program = require("commander")
var test = require('../src/')
let version = require("../package.json").version

program.version(version)
program.option('-c, --config <config>', 'customize config')
program.option('-w, --watch', 'auto watch test spec')

program.parse(process.argv)

let config = program.config
let autowatch = program.watch

test(autowatch)