#! /usr/bin/env node

var program = require("commander")

var tasks = require('../packages/nva-task/src').default
tasks.vendor()