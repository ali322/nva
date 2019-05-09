const program = require('commander')
const checkVersion = require('../lib/check-version')
const checkPKG = require('../lib/check-pkg')

program.option('--protocol [protocol]', 'dev server protocol', 'http')
program.option('--host [host]', 'dev server listen hostname', 'localhost')
program.option('-p, --port [value]', 'dev server listen port', 3000)
program.option('--env [value]', 'development environment', '')
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
const env = program.env

const options = require('../lib/option')({ env })
const tasks = require('nva-task')(options)

const dev = () => {
  tasks.dev({ protocol, hostname, port, browser, profile })
}
const started = parseInt(process.env.started)

if (silent) {
  dev()
} else {
  if (started === 0) {
    checkVersion(
      checkPKG.bind(null, dev, tasks.context.autocheck, useYarn),
      useYarn
    )
  } else {
    dev()
  }
}
