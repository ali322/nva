#! /usr/bin/env node

let program = require('commander')
let context = require('../lib/context')()
let checkVersion = require('../lib/check-version')
let checkPKG = require('../lib/check-pkg')

program.option('-P, --profile', 'enable profile mode', false)
program.option('--yarn', 'use yarn instead of npm')
program.parse(process.argv)

let profile = program.profile
let useYarn = program.yarn

checkVersion(
  checkPKG.bind(
    null,
    () => {
      let tasks = require('nva-task')(context)
      tasks.build({ profile })
    },
    context.proj.autocheck,
    useYarn
  ),
  useYarn
)
