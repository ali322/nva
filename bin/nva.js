#!/usr/bin/env node

const program = require('commander')
const version = require('../package.json').version

program
  .version(version)
  .usage('<command> [options]')
  .option('-v, --version')
  .command('init [project]', 'generate project by template')
  .command('list', 'list all available templates')
  .command('mod', 'module management')
  .command('dev', 'start dev server')
  .command('build', 'build source')
  .command('vendor', 'build vendor libraries')
  .command('use', 'switch npm or yarn mirror')
  .command('*')
  .action(function (cmd) {
    if (
      ['init', 'list', 'mod', 'dev', 'build', 'vendor', 'use'].indexOf(cmd) === -1
    ) {
      console.log('unsupported nva command')
      process.exit(1)
    }
  })

program.parse(process.argv)
