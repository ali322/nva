#! /usr/bin/env node

var program = require("commander"),
    chalk = require("chalk"),
    fs = require('fs-extra'),
    path = require('path'),
    _ = require('lodash')
var lib = require('../lib')
var config = require("../lib/config")
var questions = config.questions('mod')
var tasks = require('nva-task')()

program.usage('[name]')
program.option("-d, --delete", "delete action flag")
program.option("-t, --template [value]", "choose template module")

program.on('--help', function() {
    console.log(`
  Examples:

    ${chalk.cyan(' # add a new module in project')}
    nva mod todo
    
    ${chalk.cyan(' # add new modules in project,spit name with \',\'')}
    nva mod todo,...

    ${chalk.cyan(' # add new modules in project base on template module \',\'')}
    nva mod todo -t <template module>

    ${chalk.cyan(' # remove modules in project,spit name with \',\'')}
    nva mod todo,... -d

    `)
})

program.parse(process.argv)
if (!program.args.length) {
    program.help()
}

var moduleName = program.args[0]
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