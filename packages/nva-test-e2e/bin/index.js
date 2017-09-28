#! /usr/bin/env node

var program = require('commander')
var test = require('../src/')
let version = require('../package.json').version

program.version(version)
program.option('-r, --runner <runner>', 'how to start project')
program.option('-c, --config <config>', 'customize config')
program.option(
  '    --browser <browser>',
  'which browser to run e2e test',
  'chrome'
)

program.parse(process.argv)

let runner = program.runner
let config = program.config
let browser = program.browser

test(runner, config, browser)
