#!/usr/bin/env node

var program = require("commander")
var version = require("../package.json").version

program.version(version)
    .usage('<command> [options]')
    .command('init [project]','generate project by template')
    .command('list','list all available templates')
    .command('dev','start dev server')
    .command('hmr','start hmr server')
    .command('release','release static')
    .command('vendor','release vendor libraries')

program.parse(process.argv)