let program = require("commander")
let hooks = require('../lib/hook')
let checkVersion = require('../lib/check-version')

program.option("-p, --port [value]", "dev server listen port")
program.option("-b, --browser [browser]", "which browser to open", 'default')
program.option("-P, --profile", "enable profile mode", false)

program.parse(process.argv)

let port = program.port
let browser = program.browser
let profile = program.profile

checkVersion(function(){
    let tasks = require('nva-task')({ hooks })
    tasks.dev({ port, browser, profile })
})
