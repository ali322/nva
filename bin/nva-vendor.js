#! /usr/bin/env node

const context = require('../lib/context')()
const tasks = require('../packages/nva-task/lib')(context)
tasks.vendor()
