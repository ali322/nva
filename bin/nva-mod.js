#! /usr/bin/env node

var program = require("commander"),
    chalk = require("chalk"),
    fs = require('fs-extra'),
    path = require('path')
var lib = require('../lib')
var tasks = require('nva-task')

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
    return
}
if(program.delete){
    tasks.removeModule(moduleName)
    return
}

var MODULE_CONFIG_FILE = path.join(process.cwd(), '.nva','module.json')
var moduleConfig = {}
if (fs.existsSync(MODULE_CONFIG_FILE)) {
    moduleConfig = JSON.parse(fs.readFileSync(MODULE_CONFIG_FILE, 'utf8'))
} else {
    fs.ensureFileSync(MODULE_CONFIG_FILE)
}

if (Object.keys(moduleConfig).indexOf(moduleName) > -1) {
    console.log(chalk.red('name existed!'))
    return
}

var questions = [{
    type: 'input',
    name: 'path',
    message: 'path of module'
}, {
    type: 'input',
    name: 'html',
    message: "htmls of module,split htmls with ','"
}, {
    type: 'input',
    name: 'entryJS',
    message: "entry js's path,supported ext: .js, .es6, .jsx"
}, {
    type: 'input',
    name: 'entryCSS',
    message: "entry css's path,supported ext: .css, .styl, .less, .sass"
}, {
    type: 'input',
    name: 'vendorJS',
    message: "bundle name of vendor js"
}, {
    type: 'input',
    name: 'vendorCSS',
    message: "bundle name of vendor css"
}, {
    type: "confirm",
    name: 'yes',
    message: "Are your sure about above answers?"
}]

lib.ask(questions, 'yes', function(answers) {
    delete answers.yes
    tasks.addModule(moduleName,answers,program.template)
})