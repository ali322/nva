#! /usr/bin/env node

let program = require("commander"),
    chalk = require("chalk"),
    fs = require('fs-extra'),
    path = require('path'),
    _ = require('lodash')
let lib = require('../lib')
let config = require("../lib/config")
let questions = config.questions('bundle')
let tasks = require('../packages/nva-task/src').default()

program.usage('[name]')
program.option("-d, --delete", "delete action flag")
program.option("-t, --template [value]", "choose template bundle")

program.on('--help', function() {
    console.log(`
  Examples:

    ${chalk.cyan(' # add a new bundle in project')}
    nva bundle todo
    
    ${chalk.cyan(' # add new bundles in project,spit name with \',\'')}
    nva bundle todo,...

    ${chalk.cyan(' # add new bundle in project base on template bundle \',\'')}
    nva bundle todo -t template-bundle

    ${chalk.cyan(' # remove bundles in project,spit name with \',\'')}
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
    tasks.removeMod(moduleName)
    process.exit(1)
}

lib.ask(questions, 'yes', function(answers) {
    answers = _.omit(answers, 'yes')

    _.forEach(questions, function(q) {
        if (_.get(answers, q.name) === '') {
            answers = _.omit(answers, q.name)
        }
    })
    answers = _.omitBy(answers, function(v) {
        return _.isEmpty(v)
    })
    tasks.addMod(moduleName, answers, program.template)
})