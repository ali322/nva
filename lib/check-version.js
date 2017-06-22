let axios = require('axios')
let semver = require('semver')
let chalk = require('chalk')
let inquirer = require("inquirer")
let execSync = require('execa').shellSync
let platform = require('os').platform()
let pkgJSON = require('../package.json')

module.exports = function(done) {
    if (!semver.satisfies(process.version, pkgJSON.engines.node)) {
        console.log(chalk.red(
            'You must upgrade node to >=' + packageConfig.engines.node + '.x to use nva'
        ))
        if (platform === 'darwin') {
            console.log(`recommend to use ${chalk.cyan('https://github.com/creationix/nvm')} upgrade and manage node version`)
        } else if (platform === 'win32') {
            console.log(`recommend go to ${chalk.cyan('https://nodejs.org/')} download latest version`)
        }
        process.exit(1)
    }

    axios.get('https://registry.npmjs.org/nva').then(function(ret) {
        if (ret.status === 200) {
            let latest = ret.data['dist-tags'].latest
            let local = pkgJSON.version
            if (semver.lt(local, latest)) {
                console.log(chalk.yellow('A newer version of nva is available.'))
                console.log('latest:    ' + chalk.green(latest))
                console.log('installed: ' + chalk.gray(local))
                inquirer.prompt([{
                    type: "confirm",
                    name: 'yes',
                    message: "upgrade nva to latest version?"
                }]).then(function(answer) {
                    if (answer.yes) {
                        try {
                            execSync('npm i nva -g', { stdio: 'inherit' })
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
    }).catch(function() {
        done()
    })
}