let program = require('commander')
let context = require('../lib/context')()
let checkVersion = require('../lib/check-version')
let checkPKG = require('../lib/check-pkg')

program.option('-p, --port [value]', 'dev server listen port')
program.option('-b, --browser [browser]', 'which browser to open', 'default')
program.option('-P, --profile', 'enable profile mode', false)
program.option('--yarn', 'use yarn instead of npm')
program.option('--silent', 'ignore update check')

program.parse(process.argv)

let port = program.port
let browser = program.browser
let profile = program.profile
let useYarn = program.yarn
let silent = program.silent

let dev = () => {
  let tasks = require('nva-task')(context)
  tasks.dev({ port, browser, profile })
}
let started = parseInt(process.env.started)

if (silent) {
  dev()
} else {
  if (started === 0) {
    checkVersion(
      checkPKG.bind(null, dev, context.proj.autocheck, useYarn),
      useYarn
    )
  } else {
    dev()
  }
}
