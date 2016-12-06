#!/usr/bin/env node

var program = require("commander")
var version = require("../package.json").version

program.version(version)
    .usage('<command> [options]')
    .command('init','generate project by template')
    .command('list','list all available templates')
    .parse(process.argv)