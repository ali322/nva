#! /usr/bin/env node

var program = require("commander")
var test = require('nva-test')

program.option('    --e2e', 'is e2e test or not')
program.option('-r, --runner <runner>', 'how to start project')
program.option('-c, --config <config>', 'customize nightwatch config')
program.option('    --browser <browser>', 'which browser to run e2e test', 'chrome')
program.option('-w, --watch', 'auto watch test spec')

program.parse(process.argv)

let e2e = program.e2e
let runner = program.runner
let config = program.config
let browser = program.browser
let autowatch = program.watch

if (e2e) {
    test.e2e(runner, config, browser)
} else {
    test.unit(autowatch)
}