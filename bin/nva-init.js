#! /usr/bin/env node

let program = require("commander")
let chalk = require("chalk")
let path = require("path")
let fs = require("fs")
let objectAssign = require("object-assign")
let inquirer = require("inquirer")
let rm = require("rimraf").sync

let config = require("../lib/config")
let generator = require('../lib/generator')
let isWebProject = require('../lib').isWebProject

program.usage('[project]')
program.option("-r, --repo [value]", "choose specified repo")

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

let projectName = program.args[0]
let projectPath = path.resolve(projectName)

if (projectName === '[object Object]') {
    console.log(chalk.red('name required!'))
    program.help()
    process.exit(1)
}
if (fs.existsSync(projectPath)) {
    inquirer.prompt([{
        type: "confirm",
        name: 'yes',
        message: "current project directory is not empty,continue?"
    }]).then(function(answer) {
        if (answer.yes) {
            rm(projectPath)
            ask(generator)
        }
    })
} else {
    ask(generator)
}

function ask(cb) {
    var _questions = config.questions()
    _questions[1] = objectAssign({}, _questions[1], { when: isWebProject })
    _questions[2] = objectAssign({}, _questions[2], { when: isWebProject })
    _questions.push({
        type: "confirm",
        name: 'yes',
        message: "Are your sure about above answers?"
    })
    if (repo) {
        _questions = _questions.filter(function(v) {
            return v.name !== "template"
        })
    }
    inquirer.prompt(_questions).then(function(answers) {
        if (answers.yes) {
            cb(projectName, projectPath, answers, repo)
        } else {
            ask(cb)
        }
    })
}