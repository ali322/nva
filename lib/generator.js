let ora = require('ora')
let execSync = require('execa').shellSync
let fs = require('fs-extra')
let chalk = require('chalk')
let config = require('./config')
let download = require('./index').download
let updatePkgJSON = require('./index').updatePkgJSON

function generator(projectName, destPath, answers, repo, autoInstall, mirror) {
    fs.mkdirsSync(destPath)
    var _template = config.repoForTemplate(answers.template)

    var _suffix = []
    answers.framework === 'vue' && _suffix.push('vue')
    answers.spa && _suffix.push('spa')
    _template += _suffix.length > 0 ? '#' + _suffix.join('-') : ''

    var _repo = repo ? repo : _template
    var _dest = repo ? 'repo: ' + repo : 'template: ' + answers.template

    var spinner = ora(`Downloading ${_dest} for project`)
    spinner.start()

    return download(_repo, destPath).then(function() {
        spinner.stop()

        updatePkgJSON(projectName, destPath, answers)

        if (mirror === 'taobao') {
            try {
                execSync(`npm config set registry https://registry.npm.taobao.org`, { stdio: 'inherit' })
                execSync(`npm config set disturl https://npm.taobao.org/dist`, { stdio: 'inherit' })
            } catch (err) {
                console.log(err)
                process.exit(1)
            }
        }

        if (autoInstall) {
            try {
                process.chdir(destPath)
                execSync(`npm install`, { stdio: 'inherit' })
            } catch (err) {
                console.log(err)
                process.exit(1)
            }
        }
        var completeMsg = `Successfully generated project '${projectName}'`
        console.log(chalk.yellow(completeMsg))
    }).catch(function(err) {
        console.log(chalk.red(`\n can not download ${_dest}`), err)
        process.exit(1)
    })
}

module.exports = generator