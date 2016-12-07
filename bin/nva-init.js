#! /usr/bin/env node

var program = require("commander")
var chalk = require("chalk")
var path = require("path")
var fs = require("fs")
var inquirer = require("inquirer")
var download = require("download-git-repo")
var ora = require("ora")
var rm = require("rimraf").sync

var config = require("../lib/config")

program.usage('[project]')
program.option("-r, --repo [value]","choose specified repo")

program.on('--help',function(){
    console.log(`
  Examples:

    ${chalk.cyan(' # create a new project by specified template')}
    nva init Todo
    
    ${chalk.cyan(' # create a new project by specified github repo')}
    nva init Todo -r ali322/frontend-scaffold

    `)
})

program.parse(process.argv)

if(!program.args.length){
    program.help()
}

var repo = program.repo

var projectName = program.args[0]
var projectPath = path.resolve(projectName)

if(fs.existsSync(projectPath)){
    inquirer.prompt([{
        type:"confirm",
        name:'yes',
        message:"current project directory is not empty,continue?"
    }]).then(function(answer){
        if(answer.yes){
            rm(projectPath)
            generateProject()
        }
    })
}else{
    generateProject()
}

function ask(cb){
    var _questions = config.questions()
    _questions.push({
        type:"confirm",
        name:'yes',
        message:"Are your sure about above answers?"
    })
    if(repo){
        _questions = _questions.filter(function(v){
            return v.name !== "template"
        })
    }
    inquirer.prompt(_questions).then(function(answers){
        if(answers.yes){
            cb(answers)
        }else{
            ask()
        }
    })
}

function generateProject(){
    fs.mkdirSync(projectPath)
    ask(function(answers){
        var _template = config.repoForTemplate(answers.template)
        var _repo = repo?repo:_template
        if(!_repo){
            console.log(chalk.red("invalid template"))
            process.exit(1)
        }

        var _dest =  repo?'repo '+repo:'template '+answers.template
        var spinner = ora(`Downloading ${_dest} for project`)
        spinner.start()
        download(_repo,projectPath,function(err){
            if(err){
                console.log(chalk.red(`can not download ${_dest}`)
                process.exit(1)
            }
            spinner.stop()

            updatePkgJSON(answers)
            var completeMsg = `Successfully generated project '${projectName}',please run 'npm install' before get started`
            console.log(chalk.yellow(completeMsg))
        }) 
    })
}

function updatePkgJSON(answers){
    var pkgJSONPath = path.resolve(projectName,"package.json")
    var pkgJSON = fs.readFileSync(pkgJSONPath)
    pkgJSON = JSON.parse(pkgJSON)
    pkgJSON['name'] = projectName
    pkgJSON['description'] = answers.description
    pkgJSON['version'] = answers.version
    pkgJSON['author'] = answers.author
    pkgJSON['license'] = answers.license
    pkgJSON['repository'] = {
        "type": "git",
        "url": `git+${answers.respository}`
    }
    pkgJSON["bugs"] = {"url":""}
    pkgJSON["homepage"] = ""
    fs.writeFileSync(pkgJSONPath,JSON.stringify(pkgJSON,null,2))
}