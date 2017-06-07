#! /usr/bin/env node

var program = require("commander")
var test = require('nva-test')

program.option('-c, --config <config>', 'customize config')
program.option('-w, --watch', 'auto watch test spec')

program.parse(process.argv)

let config = program.config
let autowatch = program.watch


test(autowatch)