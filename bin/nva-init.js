#! /usr/bin/env node

let program = require("commander")
let chalk = require("chalk")
let path = require("path")
let fs = require("fs")
let _ = require('lodash')
let objectAssign = require("object-assign")
let inquirer = require("inquirer")
let rm = require("rimraf").sync

let config = require("../lib/config")
let generator = require('../lib/generator')
let lib = require('../lib')

program.usage('[project]')
program.option("-r, --repo [value]", "choose specified repo")
program.option("--no-install", "do not execute npm install?")

program.on('--help', function() {
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

let repo = program.repo
let noInstall = program.noInstall

let projectName = program.args[0]
let projectPath = path.resolve(projectName)

if (projectName === '[object Object]') {
    console.log(chalk.red('name required!'))
    program.help()
    process.exit(1)
}

let questions = config.questions('init')

questions[1] = _.assign({}, questions[1], { when: lib.isWebProject })
questions[2] = _.assign({}, questions[2], { when: lib.isWebProject })
questions[3] = _.assign({}, questions[2], { when: lib.isWebProject })

if (repo) {
    questions = _.reject(questions, function(v) {
        return v.name === 'template'
    })
}

function generate(answers) {
    generator(projectName, projectPath, answers, repo, !noInstall)
}

if (fs.existsSync(projectPath)) {
    inquirer.prompt([{
        type: "confirm",
        name: 'yes',
        message: "current project directory is not empty,continue?"
    }]).then(function(answer) {
        if (answer.yes) {
            rm(projectPath)
            lib.ask(questions, 'yes', generate)
        }
    })
} else {
    lib.ask(questions, 'yes', generate)
}