#! /usr/bin/env node

var program = require('commander')
var test = require('../lib/')
let version = require('../package.json').version

program.version(version)
program.option('-c, --config <config>', 'customize config')
program.option('-p, --port <port>', 'customize port', 9876)
program.option(
  '    --browser <browser>',
  'which browser to run e2e test',
  'chrome'
)

program.parse(process.argv)

let server = program.server
let config = program.config
let port = program.port
let browser = program.browser

test(config, port, browser)
