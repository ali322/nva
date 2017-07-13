#! /usr/bin/env node

let project = require('../lib/project')()
let tasks = require('nva-task')(project)
tasks.vendor()