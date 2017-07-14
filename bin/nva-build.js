#! /usr/bin/env node

let program = require("commander")
let project = require('../lib/project')()
let checkVersion = require('../lib/check-version')
let checkPKG = require('../lib/check-pkg')

program.option("-p, --profile", "enable profile mode", false)
program.parse(process.argv)

let profile = program.profile

checkVersion(checkPKG.bind(null, function() {
    let tasks = require('nva-task')(project)
    tasks.build({ profile })
}, project.autocheck))