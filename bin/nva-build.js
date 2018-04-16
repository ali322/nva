#! /usr/bin/env node

const program = require('commander')
const context = require('../lib/context')()
const checkVersion = require('../lib/check-version')
const checkPKG = require('../lib/check-pkg')

program.option('-P, --profile', 'enable profile mode', false)
program.option('--yarn', 'use yarn instead of npm')
program.option('--silent', 'ignore update check')
program.parse(process.argv)

const profile = program.profile
const useYarn = program.yarn
const silent = program.silent

const build = () => {
  const tasks = require('../packages/nva-task/lib')(context)
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
