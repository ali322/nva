#! /usr/bin/env node

const program = require('commander')
const chalk = require('chalk')
const inquirer = require('inquirer')
const omit = require('lodash/omit')
const get = require('lodash/get')
const forEach = require('lodash/forEach')
const omitBy = require('lodash/omitBy')
const isEmpty = require('lodash/isEmpty')
const context = require('../lib/context')()
const lib = require('../lib')
const config = require('../lib/config')
const questions = config.questions('bundle')
const tasks = require('../packages/nva-task/lib')(context)

program.usage('[name]')
program.option('-d, --delete', 'delete action flag')
program.option('-t, --template [value]', 'choose template bundle')

program.on('--help', function () {
  console.log(`
  Examples:

    ${chalk.cyan(' # add a new bundle in project')}
    nva bundle todo
    
    ${chalk.cyan(" # add new bundles in project,spit name with ','")}
    nva bundle todo,...

    ${chalk.cyan(" # add new bundle in project base on template bundle ','")}
    nva bundle todo -t template-bundle

    ${chalk.cyan(" # remove bundles in project,spit name with ','")}
    nva bundle todo,... -d

    `)
})

program.parse(process.argv)
if (!program.args.length) {
  program.help()
}

const moduleName = program.args[0]
if (moduleName === '[object Object]') {
  console.log(chalk.red('name required!'))
  program.help()
  process.exit(1)
}

if (program.delete) {
  inquirer
    .prompt([
      {
        type: 'confirm',
        name: 'yes',
        message: `are you sure to delete bundle '${moduleName}'?`
      }
    ])
    .then(function (answer) {
      tasks.removeMod(moduleName)
      process.exit(1)
    })
} else {
  lib.ask(questions, 'yes', function (answers) {
    answers = omit(answers, 'yes')

    forEach(questions, function (q) {
      if (get(answers, q.name) === '') {
        answers = omit(answers, q.name)
      }
    })
    answers = omitBy(answers, function (v) {
      return isEmpty(v)
    })
    tasks.addMod(moduleName, answers, program.template)
  })
}
