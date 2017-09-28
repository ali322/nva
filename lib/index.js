let path = require('path')
let fs = require('fs-extra')
let inquirer = require('inquirer')
let downloadGitRepo = require('download-git-repo')

exports.ask = function ask (questions, stop, cb) {
  inquirer.prompt(questions).then(function (answers) {
    if (answers[stop]) {
      cb(answers)
    } else {
      ask(questions)
    }
  })
}

exports.download = function (repo, destPath) {
  return new Promise(function (resolve, reject) {
    downloadGitRepo(repo, destPath, function (err) {
      if (err) reject(err)
      resolve(true)
    })
  })
}

exports.updatePkgJSON = function (projectName, destPath, answers) {
  var pkgJSONPath = path.resolve(destPath, 'package.json')
  var pkgJSON = fs.readFileSync(pkgJSONPath)
  pkgJSON = JSON.parse(pkgJSON)
  pkgJSON['name'] = projectName
  pkgJSON['description'] = answers.description
  pkgJSON['version'] = answers.version
  pkgJSON['author'] = answers.author
  pkgJSON['license'] = answers.license
  pkgJSON['repository'] = {
    type: 'git',
    url: `git+${answers.respository}`
  }
  pkgJSON['bugs'] = { url: '' }
  pkgJSON['homepage'] = ''
  fs.writeFileSync(pkgJSONPath, JSON.stringify(pkgJSON, null, 2))
}
