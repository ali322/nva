let ora = require('ora')
let execSync = require('execa').shellSync
let fs = require('fs-extra')
let chalk = require('chalk')
let config = require('./config')
let download = require('./index').download
let { updatePkgJSON, checkYarnVersion } = require('./index')

function generator (
  projectName,
  destPath,
  answers,
  repo,
  autoInstall,
  useYarn = false
) {
  fs.mkdirsSync(destPath)
  let _template = config.repoForTemplate(answers.template)

  let _suffix = []
  answers.framework === 'vue' && _suffix.push('vue')
  answers.spa && _suffix.push('spa')
  _template += _suffix.length > 0 ? '#' + _suffix.join('-') : ''

  let _repo = repo || _template
  let _dest = repo ? 'repo: ' + repo : 'template: ' + answers.template

  let spinner = ora(`Downloading ${_dest} boilerplate project`)
  spinner.start()

  return download(_repo, destPath)
    .then(function () {
      spinner.stop()

      updatePkgJSON(projectName, destPath, answers)
      if (autoInstall) {
        try {
          process.chdir(destPath)
          let yarnVersion = checkYarnVersion()
          if (yarnVersion && useYarn) {
            execSync(`yarn install`, { stdio: 'inherit' })
          } else {
            execSync(`npm install`, { stdio: 'inherit' })
          }
        } catch (err) {
          console.log(err)
          process.exit(1)
        }
      }
      var completeMsg = `Successfully generated project '${projectName}'`
      console.log(chalk.yellow(completeMsg))
    })
    .catch(function (err) {
      console.log(chalk.red(`\n can not download ${_dest}`), err)
      process.exit(1)
    })
}

module.exports = generator
