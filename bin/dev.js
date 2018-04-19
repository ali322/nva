const program = require('commander')
const context = require('../lib/context')()
const checkVersion = require('../lib/check-version')
const checkPKG = require('../lib/check-pkg')

program.option('--protocol [protocol]', 'dev server protocol', 'http')
program.option('--host [host]', 'dev server listen hostname', 'localhost')
program.option('-p, --port [value]', 'dev server listen port', 3000)
program.option('-b, --browser [browser]', 'which browser to open', 'default')
program.option('-P, --profile', 'enable profile mode', false)
program.option('--yarn', 'use yarn instead of npm')
program.option('--silent', 'ignore update check')

program.parse(process.argv)

const protocol = program.protocol
const hostname = program.host
const port = program.port
const browser = program.browser
const profile = program.profile
const useYarn = program.yarn
const silent = program.silent

const dev = () => {
  let tasks = require('nva-task')(context)
  tasks.dev({ protocol, hostname, port, browser, profile })
}
const started = parseInt(process.env.started)

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
