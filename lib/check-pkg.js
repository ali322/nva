let axios = require('axios')
let { resolve } = require('path')
let differenceWith = require('lodash/differenceWith')
let map = require('lodash/map')
let isEqual = require('lodash/isEqual')
let isEmpty = require('lodash/isEmpty')
let pickBy = require('lodash/pickBy')
let keys = require('lodash/keys')
let chalk = require('chalk')
let inquirer = require('inquirer')
let execSync = require('execa').shellSync
let { checkYarnVersion } = require('./index')

module.exports = function (done, pkgs = [], useYarn = false) {
  if (pkgs.length === 0) {
    done()
  } else {
    let yarnVersion = checkYarnVersion()
    let locals = {}
    pkgs.forEach(v => {
      let version
      try {
        version = require(resolve('node_modules', v, 'package.json')).version
        locals[v] = version
      } catch (e) {
        locals[v] = null
      }
    })
    axios
      .all(pkgs.map(v => axios.get(`https://registry.npmjs.org/${v}`, {timeout: 3000})))
      .then(rets => {
        let latest = {}
        rets.forEach(v => {
          if (v.status === 200) {
            v = v.data
            latest[v.name] = v['dist-tags'].latest
          }
        })

        if (isEmpty(latest)) {
          done()
        }
        if (isEqual(latest, locals)) {
          done()
        } else {
          let outdated = differenceWith(
            map(latest, (v, k) => ({ name: k, version: v })),
            map(locals, (v, k) => ({ name: k, version: v })),
            (r1, r2) => r1.version === r2.version
          )
          let questions = outdated.map(v => ({
            type: 'confirm',
            name: v.name,
            message: chalk.yellow(
              `a newer version of ${v.name} is available, upgrade now?`
            )
          }))
          inquirer.prompt(questions).then(answer => {
            let upgrade = keys(pickBy(answer, v => v === true)).map(
              v => `${v}@${latest[v]}`
            )
            if (upgrade.length > 0) {
              upgrade = upgrade.join(' ')
              try {
                execSync(useYarn && yarnVersion ? `yarn add ${upgrade}` : `npm i ${upgrade} -S`, { stdio: 'inherit' })
              } catch (err) {
                console.error(err)
                process.exit(1)
              }
            }
            done()
          })
        }
      })
      .catch(() => {
        console.log(chalk.yellow(`request failed,skip checking version of ${pkgs.join(',')}`))
        done()
      })
  }
}
