#! /usr/bin/env node

let program = require("commander")
let hooks = require('../lib/hook')
let checkVersion = require('../lib/check-version')

program.option("-p, --profile","enable profile mode",false)
program.parse(process.argv)

let profile = program.profile

checkVersion(function(){
    let tasks = require('../packages/nva-task/src').default({hooks})
    tasks.build({profile})
})