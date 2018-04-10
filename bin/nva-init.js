#! /usr/bin/env node

const program = require('commander')
const chalk = require('chalk')
const path = require('path')
const fs = require('fs')
const reject = require('lodash/reject')
const inquirer = require('inquirer')
const rm = require('rimraf').sync

const config = require('../lib/config')
const generator = require('../lib/generator')
const { ask } = require('../lib')

program.usage('[project]')
program.option('-r, --repo [value]', 'choose specified repo')
program.option('--no-install', 'do not execute npm install')
program.option('--yarn', 'use yarn instead of npm')

program.on('--help', function () {
  console.log(`
  Examples:

    ${chalk.cyan(' # create a new project by specified template')}
    nva init Todo
    
    ${chalk.cyan(' # create a new project by specified github repo')}
    nva init Todo -r ali322/frontend-scaffold

    `)
})

program.parse(process.argv)

if (!program.args.length) {
  program.help()
}

const repo = program.repo
const noInstall = program.noInstall
const useYarn = program.yarn

const projectName = program.args[0]
const projectPath = path.resolve(projectName)

if (projectName === '[object Object]') {
  console.log(chalk.red('name required!'))
  program.help()
  process.exit(1)
}

let questions = config.questions('init')

if (repo) {
  questions = reject(questions, function (v) {
    return v.name === 'template'
  })
}

function generate (answers) {
  generator(projectName, projectPath, answers, repo, !noInstall, useYarn)
}

if (fs.existsSync(projectPath)) {
  inquirer
    .prompt([
      {
        type: 'confirm',
        name: 'yes',
        message: 'current project directory is not empty,continue?'
      }
    ])
    .then(function (answer) {
      if (answer.yes) {
        rm(projectPath)
        ask(questions, 'yes', generate)
      }
    })
} else {
  ask(questions, 'yes', generate)
}
