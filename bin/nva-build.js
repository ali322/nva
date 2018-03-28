#! /usr/bin/env node

let program = require('commander')
let context = require('../lib/context')()
let checkVersion = require('../lib/check-version')
let checkPKG = require('../lib/check-pkg')

program.option('-P, --profile', 'enable profile mode', false)
program.option('--yarn', 'use yarn instead of npm')
program.option('--silent', 'ignore update check')
program.parse(process.argv)

let profile = program.profile
let useYarn = program.yarn
let silent = program.silent

let build = () => {
  let tasks = require('nva-task')(context)
  tasks.build({ profile })
}

if (silent) {
  build()
} else {
  checkVersion(
    checkPKG.bind(
      null,
      build,
      context.proj.autocheck,
      useYarn
    ),
    useYarn
  )
}
