#! /usr/bin/env node

var program = require("commander"),
    chalk = require("chalk"),
    fs = require('fs-extra'),
    path = require('path')
var lib = require('../lib')
var tasks = require('nva-task')()

program.usage('[name]')
program.option("-d, --delete","delete action flag")
program.option("-t, --template [value]","choose template module")

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
if(moduleName === '[object Object]'){
    console.log(chalk.red('name required!'))
    program.help()
    process.exit(1)
}

if(program.delete){
    tasks.removeMod(moduleName)
    process.exit(1)
}

var questions = [{
    type: 'input',
    name: 'input.html',
    message: "entry html's path"
}, {
    type: 'input',
    name: 'input.js',
    message: "entry js's path,supported ext: .js, .es6, .jsx"
}, {
    type: 'input',
    name: 'input.css',
    message: "entry css's path,supported ext: .css, .styl, .less, .sass"
}, {
    type: 'input',
    name: 'vendor.js',
    message: "bundle name of vendor js"
}, {
    type: 'input',
    name: 'vendor.css',
    message: "bundle name of vendor css"
}, {
    type: "confirm",
    name: 'yes',
    message: "Are your sure about above answers?"
}]

lib.ask(questions, 'yes', function(answers) {
    delete answers.yes
    tasks.addMod(moduleName,answers,program.template)
})