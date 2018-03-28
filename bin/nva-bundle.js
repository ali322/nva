#! /usr/bin/env node

let program = require('commander')
let chalk = require('chalk')
let inquirer = require('inquirer')
let omit = require('lodash/omit')
let get = require('lodash/get')
let forEach = require('lodash/forEach')
let omitBy = require('lodash/omitBy')
let isEmpty = require('lodash/isEmpty')
let context = require('../lib/context')()
let lib = require('../lib')
let config = require('../lib/config')
let questions = config.questions('bundle')
let tasks = require('nva-task')(context)

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

let moduleName = program.args[0]
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
