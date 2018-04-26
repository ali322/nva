const ora = require('ora')
const execSync = require('execa').shellSync
const fs = require('fs-extra')
const chalk = require('chalk')
const config = require('./config')
const { updatePkgJSON, checkYarnVersion, download } = require('./index')

function generator (
  projectName,
  destPath,
  answers,
  repo,
  autoInstall,
  useYarn = false
) {
  fs.mkdirsSync(destPath)
  let template = config.repoForTemplate(answers.template)

  let suffix = []
  answers.framework === 'vue' && suffix.push('vue')
  answers.spa && suffix.push('spa')
  template += suffix.length > 0 ? '#' + suffix.join('-') : ''

  let repository = repo || template
  let repositoryLabel = repo ? `repo: ${repo}` : `template: ${template}`

  let spinner = ora(`Downloading ${repositoryLabel} boilerplate project`)
  spinner.start()

  return download(repository, destPath)
    .then(function () {
      spinner.stop()

      updatePkgJSON(projectName, destPath, answers)
      if (autoInstall) {
        try {
          process.chdir(destPath)
          const yarnVersion = checkYarnVersion()
          if (yarnVersion && useYarn) {
            execSync('yarn install', { stdio: 'inherit' })
          } else {
            execSync('npm install', { stdio: 'inherit' })
          }
        } catch (err) {
          console.log(err)
          process.exit(1)
        }
      }
      console.log(chalk.yellow(`Successfully generated project '${projectName}'`))
    })
    .catch(function (err) {
      console.log(chalk.red(`\n can not download ${repositoryLabel}`), err)
      process.exit(1)
    })
}

module.exports = generator
