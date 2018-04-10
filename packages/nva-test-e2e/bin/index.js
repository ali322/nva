#! /usr/bin/env node

const program = require('commander')
const test = require('../lib/')
const version = require('../package.json').version

program.version(version)
program.option('-c, --config <config>', 'customize config')
program.option('-p, --port <port>', 'customize port', 9876)
program.option(
  '    --browser <browser>',
  'which browser to run e2e test',
  'chrome'
)

program.parse(process.argv)

const config = program.config
const port = program.port
const browser = program.browser

test(config, port, browser)
