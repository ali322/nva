let program = require("commander")
let project = require('../lib/project')()
let checkVersion = require('../lib/check-version')
let checkPKG = require('../lib/check-pkg')

program.option("-p, --port [value]", "dev server listen port")
program.option("-b, --browser [browser]", "which browser to open", 'default')
program.option("-P, --profile", "enable profile mode", false)

program.parse(process.argv)

let port = program.port
let browser = program.browser
let profile = program.profile

checkVersion(function() {
    checkPKG(function() {
        let tasks = require('nva-task')(project)
        tasks.dev({ port, browser, profile })
    }, project.autocheck)
})