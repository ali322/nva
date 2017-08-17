#! /usr/bin/env node

let context = require('../lib/context')()
let tasks = require('nva-task')(context)
tasks.vendor()