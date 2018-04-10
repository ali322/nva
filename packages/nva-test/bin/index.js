#! /usr/bin/env node

const program = require("commander")
const test = require("../lib/")
const version = require("../package.json").version

program.version(version)
program.option("-c, --config <config>", "customize config")
program.option("-w, --watch", "auto watch test spec")

program.parse(process.argv)

const autowatch = program.watch

test(autowatch)
