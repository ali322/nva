#!/usr/bin/env node

var program = require("commander")
var version = require("../package.json").version

program.version(version)
    .usage('<command> [options]')
    .command('init [project]','generate project by template')
    .command('list','list all available templates')

program.parse(process.argv)