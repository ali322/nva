let ora = require('ora')
let execSync = require('execa').shellSync
let fs = require('fs-extra')
let chalk = require('chalk')
let config = require('./config')
let download = require('./index').download
let isWebProject = require('./index').isWebProject
let updatePkgJSON = require('./react-native').updatePkgJSON
let updateRNIndex = require('./react-native').updateRNIndex

function generator(projectName, destPath, answers, repo) {
    if (answers.template === 'react-native') {
        try {
            execSync(`react-native init ${projectName}`, { stdio: 'inherit' })
        } catch (err) {
            console.log(err)
            process.exit(1)
        }
    } else {
        fs.mkdirsSync(destPath)
    }
    var _template = config.repoForTemplate(answers.template)
    if (isWebProject(answers)) {
        var _suffix = []
        answers.framework === 'vue' && _suffix.push('vue')
        answers.spa && _suffix.push('spa')
        _template += _suffix.length > 0 ? '#' + _suffix.join('-') : ''
    }
    var _repo = repo ? repo : _template
    var _dest = repo ? 'repo: ' + repo : 'template: ' + answers.template

    var spinner = ora(`Downloading ${_dest} for project`)
    spinner.start()

    return download(_repo, destPath).then(function() {
        spinner.stop()

        updatePkgJSON(projectName, destPath, answers)

        if (answers.template === "react-native") {
            updateRNIndex(projectName, destPath)
        }
        try {
            execSync(`cd ${destPath} && npm install`, { stdio: 'inherit' })
        } catch (err) {
            console.log(err)
            process.exit(1)
        }
        var completeMsg = `Successfully generated project '${projectName}'`
        console.log(chalk.yellow(completeMsg))
    }).catch(function(err) {
        console.log(chalk.red(`\n can not download ${_dest}`), err)
        process.exit(1)
    })
}

module.exports = generator