const axios = require('axios')
const semver = require('semver')
const chalk = require('chalk')
const inquirer = require('inquirer')
const execSync = require('execa').shellSync
const platform = require('os').platform()
const pkgJSON = require('../package.json')
const { checkYarnVersion } = require('./index')

module.exports = function (done, useYarn = false) {
  if (!semver.satisfies(process.version, pkgJSON.engines.node)) {
    console.log(
      chalk.red(
        'You must upgrade node to >=' + pkgJSON.engines.node + '.x to use nva'
      )
    )
    if (platform === 'darwin') {
      console.log(
        `recommend to use ${chalk.cyan(
          'https://github.com/creationix/nvm'
        )} upgrade and manage node version`
      )
    } else if (platform === 'win32') {
      console.log(
        `recommend go to ${chalk.cyan(
          'https://nodejs.org/'
        )} download latest version`
      )
    }
    process.exit(1)
  }

  const yarnVersion = checkYarnVersion()

  axios
    .get('https://registry.npmjs.org/nva', {timeout: 3000})
    .then(function (ret) {
      if (ret.status === 200) {
        const latest = ret.data['dist-tags'].latest
        const local = pkgJSON.version
        if (semver.lt(local, latest)) {
          console.log(chalk.yellow('A newer version of nva is available.'))
          console.log('latest:    ' + chalk.green(latest))
          console.log('installed: ' + chalk.gray(local))
          inquirer
            .prompt([
              {
                type: 'confirm',
                name: 'yes',
                message: 'upgrade nva to latest version?'
              }
            ])
            .then(function (answer) {
              if (answer.yes) {
                try {
                  execSync(useYarn && yarnVersion ? 'yarn global add nva' : 'npm i nva -g', { stdio: 'inherit' })
                  done()
                } catch (err) {
                  console.error(err)
                  process.exit(1)
                }
              } else {
                done()
              }
            })
        } else {
          done()
        }
      } else {
        done()
      }
    })
    .catch(function () {
      console.log(chalk.yellow('request failed,skip checking version of nva'))
      done()
    })
}
