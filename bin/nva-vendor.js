#! /usr/bin/env node

let hooks = require('../lib/hook')
let tasks = require('../packages/nva-task/src').default({hooks})
tasks.vendor()