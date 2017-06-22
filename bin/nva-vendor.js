#! /usr/bin/env node

let hooks = require('../lib/hook')
let tasks = require('nva-task')({hooks})
tasks.vendor()