#! /usr/bin/env node

let context = require('../lib/context')()
let tasks = require('../packages/nva-task/lib')(context)
tasks.vendor()
