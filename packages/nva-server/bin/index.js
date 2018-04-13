#! /usr/bin/env node

const program = require('commander')
const chalk = require('chalk')
const opn = require('opn')
const assign = require('lodash/assign')
const join = require('path').join
const version = require('../package.json').version

program
  .version(version)
  .option('-v, --version')
  .option('-c, --content <content>', 'serve content path')
  .option(
    '-a, --asset <asset>',
    'serve asset path,if not set then content value by default'
  )
  .option('--host [host]', 'listening host', 'localhost')
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
const hostname = program.host
const port = program.port
const rewrites = program.rewrites
const cors = program.cors
const log = program.log
const mock = program.mock
const content = program.content
const asset = program.asset

let options = {
  browser,
  index,
  hostname,
  port,
  content,
  asset,
  mock: { path: mock },
  rewrites,
  cors,
  log
}

if (config) {
  try {
    options = assign({}, require(join(process.cwd(), config)), options)
  } catch (err) {
    console.log(chalk.red('config invalid'))
    process.exit(1)
  }
}

const app = require('../lib')(options)

let server = app.listen(options.port, options.hostname, function(err) {
  if (err) console.log(err)
  openBrowser(
    options.browser,
    `http://${options.hostname}:${options.port}${options.index}`
  )
  console.log(`🌎  nva-server started at ${options.hostname}:${options.port}`)
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
  console.log('')
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
