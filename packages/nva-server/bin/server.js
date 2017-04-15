#! /usr/bin/env node

let program = require('commander')
let chalk = require('chalk')
let path = require('path')
let app = require("../dist")
let version = require("../package.json").version

program.version(version)
    .option('-v, --version')
    .option("-p, --port [port]", 'listening port',3000)
    .option("-m, --mock-path <mockpath>", 'mock config path')
    .option("-P, --paths <paths>", 'serve page paths')
    .option("-A, --asset <asset>", 'serve static asset')
    .option("    --rewrites",'enable rewrites request to index.html')
    .option("-C, --cors",'allows cross origin access serving')
    .option("-L, --log",'enable log of request')


program.parse(process.argv)

let port = program.port
let rewrites = program.rewrites
let cors = program.cors
let log = program.log
let mockPath = program.mockPath
let paths = program.paths
let asset = program.asset

if (!paths) {
    console.log(chalk.red('no paths specified'))
    process.exit(1)
}

let options = {
    paths,
    asset,
    mockPath,
    rewrites,
    cors,
    log
}

app = app(options)

let server = app.listen(port, function(err) {
    if (err) console.log(err)
    console.log(`🌎  nva-server started at %d`, port)
})

server.on('close',function(){
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