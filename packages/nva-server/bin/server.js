#! /usr/bin/env node

let program = require('commander')
let chalk = require('chalk')
let opn = require('opn')
let app = require("../dist")
let join = require("path").join
let version = require("../package.json").version

program.version(version)
    .option('-v, --version')
    .option("-c, --config <config>", 'server config path')
    .option("-p, --port [port]", 'listening port', 3000)
    .option("-m, --mock-path <mockPath>", 'mock config path')
    .option("-P, --path <path>", 'serve page path')
    .option("-A, --asset <asset>", 'serve static asset')
    .option("    --rewrites", 'enable rewrites request to index.html')
    .option("-C, --cors", 'allows cross origin access serving')
    .option("-L, --log", 'enable log of request')
    .option("-b, --browser [browser]", "which browser to open", 'default')
    .option("-i, --index [index]", 'index url', '/')



program.parse(process.argv)

let browser = program.browser
let index = program.index
let config = program.config
let port = program.port
let rewrites = program.rewrites
let cors = program.cors
let log = program.log
let mockPath = program.mockPath
let path = program.path
let asset = program.asset

let options = {
    browser,
    index,
    path,
    port,
    asset,
    mockPath,
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

if (!options.path) {
    console.log(chalk.red('no path specified'))
    process.exit(1)
}
app = app(options)

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
        opener.catch(function(err) { console.log(chalk.red('canot open in browser'), err) })
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