#!/usr/bin/env node

let program = require('commander')
let version = require('../package.json').version

program
  .version(version)
  .usage('<command> [options]')
  .option('-v, --version')
  .command('init [project]', 'generate project by template')
  .command('list', 'list all available templates')
  .command('bundle', 'bundle management')
  .command('dev', 'start dev server')
  .command('build', 'build source')
  .command('vendor', 'build vendor libraries')
  .command('use', 'switch npm or yarn mirror')
  .command('*')
  .action(function (cmd) {
    if (
      ['init', 'list', 'bundle', 'dev', 'build', 'vendor', 'use'].indexOf(cmd) === -1
    ) {
      console.log('unsupported nva command')
      process.exit(1)
    }
  })

program.parse(process.argv)
