#! /usr/bin/env node

const program = require('commander')
const chalk = require('chalk')
const opn = require('opn')
const join = require('path').join
const version = require('../package.json').version

program
  .version(version)
  .option('-v, --version')
  .option('-c, --config <config>', 'server config path')
  .option('-p, --port [port]', 'listening port', 3000)
  .option('-m, --mock <mock>', 'mock config')
  .option('-P, --path <path>', 'serve page path')
  .option('-A, --asset <asset>', 'serve static asset')
  .option('    --rewrites', 'enable rewrites request to index.html')
  .option('-C, --cors', 'allows cross origin access serving')
  .option('-L, --log', 'enable log of request')
  .option('-b, --browser [browser]', 'which browser to open', 'default')
  .option('-i, --index [index]', 'index url', '/')

program.parse(process.argv)

const browser = program.browser
const index = program.index
const config = program.config
const port = program.port
const rewrites = program.rewrites
const cors = program.cors
const log = program.log
const mock = program.mock
const path = program.path
const asset = program.asset

let options = {
  browser,
  index,
  path,
  port,
  asset,
  mock: { path: mock },
  rewrites,
  cors,
  log
}

if (config) {
  try {
    options = require(join(process.cwd(), config))
  } catch (err) {
    console.log(chalk.red('config invalid'))
    process.exit(1)
  }
}

const app = require('../lib')(options)

let server = app.listen(options.port, function(err) {
  if (err) console.log(err)
  openBrowser(browser, 'http://localhost:' + options.port + index)
  console.log(`🌎  nva-server started at %d`, options.port)
})

function openBrowser(target, url) {
  let opts = { wait: false }
  if (target !== 'none') {
    if (target !== 'default') {
      opts.app = target.split(',')
    }
    let opener = opn(url, opts)
    opener.catch(function(err) {
      console.log(chalk.red('canot open in browser'), err)
    })
  }
}

server.on('close', function() {
  console.log('bye! nva-server closed')
})

function stopServer() {
  server.close()
  process.nextTick(function() {
    process.exit(0)
  })
}

process.once('exit', stopServer)
process.once('SIGINT', stopServer)
