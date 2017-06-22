#! /usr/bin/env node

let program = require("commander")
let test = require('nva-test')

program.option('-c, --config <config>', 'customize config')
program.option('-w, --watch', 'auto watch test spec')

program.parse(process.argv)

let config = program.config
let autowatch = program.watch


test(autowatch)