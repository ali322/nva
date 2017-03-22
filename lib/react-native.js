let path = require('path')
let fs = require('fs-extra')

function updatePkgJSON(projectName, destPath, answers) {
    var pkgJSONPath = path.resolve(destPath, "package.json")
    var pkgJSON = fs.readFileSync(pkgJSONPath)
    pkgJSON = JSON.parse(pkgJSON)
    pkgJSON['name'] = projectName
    pkgJSON['description'] = answers.description
    pkgJSON['version'] = answers.version
    pkgJSON['author'] = answers.author
    pkgJSON['license'] = answers.license
    pkgJSON['repository'] = {
        "type": "git",
        "url": `git+${answers.respository}`
    }
    pkgJSON["bugs"] = { "url": "" }
    pkgJSON["homepage"] = ""
    fs.writeFileSync(pkgJSONPath, JSON.stringify(pkgJSON, null, 2))
}

function updateRNIndex(projectName, destPath) {
    var indexIOSFile = path.resolve(destPath, 'index.ios.js')
    var indexIOS = fs.readFileSync(indexIOSFile, 'utf8')
    indexIOS = indexIOS.replace('RNProject', projectName)
    fs.writeFileSync(indexIOSFile, indexIOS)

    var indexAndroidFile = path.resolve(projectName, 'index.android.js')
    var indexAndroid = fs.readFileSync(indexAndroidFile, 'utf8')
    indexAndroid = indexAndroid.replace('RNProject', projectName)
    fs.writeFileSync(indexAndroidFile, indexAndroid)
}

module.exports = { updatePkgJSON, updateRNIndex }