let inquirer = require('inquirer')
let chalk = require('chalk')
let downloadGitRepo = require('download-git-repo')

function ask(questions, stop, cb) {
    inquirer.prompt(questions).then(function(answers) {
        if (answers[stop]) {
            cb(answers)
        } else {
            ask(questions)
        }
    })
}

function interceptOptions(options = [], allowed = []) {
    let unsuppored = options.filter((v) => {
        return allowed.indexOf(v) === -1
    })
    if (unsuppored.length > 0) {
        console.log(chalk.red(`unsuppored options: ${unsuppored.join(", ")}`))
        process.exit(1)
    }
}

function isWebProject(answers) {
    return answers.template === 'frontend' || answers.template === 'isomorphic'
}

function download(repo, destPath) {
    return new Promise(function(resolve, reject) {
        downloadGitRepo(repo, destPath, function(err) {
            if (err) reject(err)
            resolve(true)
        })
    })
}

module.exports = {
    ask,
    interceptOptions,
    isWebProject,
    download
}