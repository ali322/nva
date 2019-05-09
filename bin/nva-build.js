#! /usr/bin/env node

const program = require('commander')
const checkVersion = require('../lib/check-version')
const checkPKG = require('../lib/check-pkg')

program.option('-P, --profile', 'enable profile mode', false)
program.option('--env [value]', 'build environment', '')
program.option('--yarn', 'use yarn instead of npm')
program.option('--silent', 'ignore update check')
program.parse(process.argv)

const profile = program.profile
const useYarn = program.yarn
const silent = program.silent
const env = program.env

const options = require('../lib/option')({ env })
const tasks = require('nva-task')(options)

const build = () => {
  tasks.build({ profile, env })
}

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
