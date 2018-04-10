#! /usr/bin/env node

const path = require('path')
const monitor = require('../lib/monitor')

monitor(path.join(__dirname, 'dev.js'), 'RESTART')
