#! /usr/bin/env node

var program = require('commander')
var test = require('../lib/index')
let version = require('../package.json').version

program.version(version)
program.option('-s, --server <server>', 'how to start project')
program.option('-c, --config <config>', 'customize config')
program.option(
  '    --browser <browser>',
  'which browser to run e2e test',
  'chrome'
)

program.parse(process.argv)

let server = program.server
let config = program.config
let browser = program.browser

test(server, config, browser)
