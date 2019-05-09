#! /usr/bin/env node

const program = require('commander')
const chalk = require('chalk')
const inquirer = require('inquirer')
const omit = require('lodash/omit')
const lib = require('../lib')
const config = require('../lib/config')
const options = require('../lib/option')()
const tasks = require('nva-task')(options)
const questions = config.questions('mod')

program.usage('[name]')
program.option('-d, --delete', 'delete action flag')
program.option('-t, --template [value]', 'choose existed module')

program.on('--help', function () {
  console.log(`
  Examples:

    ${chalk.cyan(' # add a new module in project')}
    nva mod todo
    
    ${chalk.cyan(" # add new module in project,spit name with ','")}
    nva mod todo,...

    ${chalk.cyan(" # add new module in project base on an existed module ','")}
    nva mod todo -t <existed-mod>

    ${chalk.cyan(" # remove module in project,spit name with ','")}
    nva mod todo,... -d

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
        message: `are you sure to delete module ${moduleName}?`
      }
    ])
    .then(function (answer) {
      tasks.removeMod(moduleName)
      process.exit(1)
    })
} else {
  lib.ask(questions, 'yes', function (answers) {
    if (answers.yes) {
      tasks.addMod(moduleName, omit(answers, 'yes'), program.template)
    }
  })
}
