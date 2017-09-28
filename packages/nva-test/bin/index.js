#! /usr/bin/env node

let program = require("commander")
let test = require("../src/")
let version = require("../package.json").version

program.version(version)
program.option("-c, --config <config>", "customize config")
program.option("-w, --watch", "auto watch test spec")

program.parse(process.argv)

let autowatch = program.watch

test(autowatch)
