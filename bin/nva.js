#!/usr/bin/env node

var program = require("commander")
var version = require("../package.json").version

program.version(version)
    .usage('<command> [options]')
    .command('init [project]','generate project by template')
    .command('list','list all available templates')
    .command('mod','add new module')
    .command('dev','start dev server')
    .command('build','build source')
    .command('vendor','build vendor libraries')
    .command('*')
    .action(function(cmd){
        if(['init','list','mod','dev','hmr','build','vendor'].indexOf(cmd) === -1){
            console.log('unsupported nva command')
            process.exit(1)
        }
    })

program.parse(process.argv)