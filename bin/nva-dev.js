#! /usr/bin/env node

let path = require('path')
let monitor = require('../lib/monitor')

monitor(path.join(__dirname,'dev.js'),'RESTART')