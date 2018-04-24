#! /usr/bin/env node

const options = require('../lib/option')
const tasks = require('nva-task')(options)
tasks.vendor()
