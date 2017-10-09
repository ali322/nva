#! /usr/bin/env node

let program = require('commander')
let context = require('../lib/context')()
let checkVersion = require('../lib/check-version')
let checkPKG = require('../lib/check-pkg')

program.option('-P, --profile', 'enable profile mode', false)
program.parse(process.argv)

let profile = program.profile

checkVersion(checkPKG.bind(null, () => {
  let tasks = require('nva-task')(context)
  tasks.build({ profile })
}, context.proj.autocheck))