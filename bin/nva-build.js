#! /usr/bin/env node

let program = require("commander")
let hooks = require('../lib/hook')
let checkVersion = require('../lib/check-version')

program.option("-p, --profile","enable profile mode",false)
program.parse(process.argv)

let profile = program.profile

checkVersion(function(){
    let tasks = require('nva-task')({hooks})
    tasks.build({profile})
})