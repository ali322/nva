#! /usr/bin/env node

const program = require('commander')
const chalk = require('chalk')
const opn = require('opn')
const join = require('path').join
const version = require('../package.json').version

program
  .version(version)
  .option('-v, --version')
  .option('-c, --content <content>', 'serve content path')
  .option('-p, --port [port]', 'listening port', 3000)
  .option('-m, --mock <mock>', 'mock config')
  .option('-b, --browser [browser]', 'which browser to open', 'default')
  .option('-i, --index [index]', 'started url', '/')
  .option('--config <config>', 'server config path')
  .option('--rewrites', 'enable rewrites request to index.html')
  .option('--cors', 'allows cross origin access serving')
  .option('--log', 'enable log of request')

program.parse(process.argv)

const browser = program.browser
const index = program.index
const config = program.config
const port = program.port
const rewrites = program.rewrites
const cors = program.cors
const log = program.log
const mock = program.mock
const content = program.content

let options = {
  browser,
  index,
  port,
  content,
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
