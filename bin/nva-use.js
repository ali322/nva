#! /usr/bin/env node

let program = require('commander')
let { switchMirror } = require('../lib/')

program.option('-m, --mirror [value]', 'which mirror do you preferred?')
program.option('--yarn', 'use yarn instead of npm')

program.on('--help', function () {
  console.log(`
    Support mirrors: npm, taobao, cnpm, nj(nodejitsu)
      `)
})

program.parse(process.argv)

let useYarn = program.yarn
let mirror = program.mirror

switchMirror(mirror, useYarn)
