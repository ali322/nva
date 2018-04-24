#! /usr/bin/env node

const program = require('commander')
const checkVersion = require('../lib/check-version')
const checkPKG = require('../lib/check-pkg')
const options = require('../lib/option')
const tasks = require('nva-task')(options)

program.option('-P, --profile', 'enable profile mode', false)
program.option('--yarn', 'use yarn instead of npm')
program.option('--silent', 'ignore update check')
program.parse(process.argv)

const profile = program.profile
const useYarn = program.yarn
const silent = program.silent

const build = () => {
  tasks.build({ profile })
}

console.log('tasks', tasks.context.autocheck)
if (silent) {
  build()
} else {
  checkVersion(
    checkPKG.bind(
      null,
      build,
      tasks.context.autocheck,
      useYarn
    ),
    useYarn
  )
}
