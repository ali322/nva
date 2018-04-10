#! /usr/bin/env node

const context = require('../lib/context')()
const tasks = require('nva-task')(context)
tasks.vendor()
