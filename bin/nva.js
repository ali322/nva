#!/usr/bin/env node

var program = require("commander")
var version = require("../package.json").version

program.version(version)
    .usage('<command> [options]')
    .option('-v, --version')
    .command('init [project]', 'generate project by template')
    .command('list', 'list all available templates')
    .command('bundle', 'bundle management')
    .command('dev', 'start dev server')
    .command('build', 'build source')
    .command('vendor', 'build vendor libraries')
    .command('test', 'run unit or e2e test')
    .command('*')
    .action(function(cmd) {
        if (['init', 'list', 'mod', 'dev', 'build', 'vendor','test'].indexOf(cmd) === -1) {
            console.log('unsupported nva command')
            process.exit(1)
        }
    })

program.parse(process.argv)