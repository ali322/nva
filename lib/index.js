let path = require('path')
let fs = require('fs-extra')
let inquirer = require('inquirer')
let downloadGitRepo = require('download-git-repo')
let execSync = require('child_process').execSync
let semver = require('semver')
let chalk = require('chalk')

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
  fs.writeFileSync(pkgJSONPath, JSON.stringify(pkgJSON, null, 2))
}

exports.checkYarnVersion = function () {
  let yarnVersion
  try {
    if (process.platform.startsWith('win')) {
      yarnVersion = (execSync('yarn --version 2> NUL').toString() || '').trim()
    } else {
      yarnVersion = (execSync('yarn --version 2>/dev/null').toString() || ''
      ).trim()
    }
  } catch (err) {
    return null
  }
  // yarn < 0.16 has a 'missing manifest' bug
  try {
    if (semver.gte(yarnVersion, '0.16.0')) {
      return yarnVersion
    } else {
      return null
    }
  } catch (err) {
    console.log('Cannot parse yarn version', yarnVersion)
    return null
  }
}

exports.switchMirror = function (mirror, useYarn = false) {
  let registry = ''
  let disturl = ''
  let client = useYarn ? 'yarn' : 'npm'

  if (['taobao', 'cnpm', 'nj', 'npm'].includes(mirror) === false) {
    console.log(chalk.red('unsupported mirror'))
    process.exit(1)
  }
  switch (mirror) {
    case 'taobao':
      registry = 'https://registry.npm.taobao.org'
      disturl = 'https://npm.taobao.org/dist'
      break
    case 'cnpm':
      registry = 'http://r.cnpmjs.org'
      disturl = 'http://cnpmjs.org/dist'
      break
    case 'nj':
      registry = 'https://registry.nodejitsu.com'
      disturl = 'https://www.nodejitsu.com'
      break
    case 'npm':
      registry = 'https://registry.npmjs.org'
      disturl = 'https://npmjs.org/dist'
      break
    default:
      break
  }
  try {
    execSync(`${client} config set registry ${registry}`, {
      stdio: 'inherit'
    })
    execSync(`${client} config set disturl ${disturl}`, {
      stdio: 'inherit'
    })
    console.log('')
    console.log(chalk.yellow(`  ${client}'s registry has set to ${registry}`))
    console.log('')
  } catch (err) {
    console.log(err)
    process.exit(1)
  }
}
