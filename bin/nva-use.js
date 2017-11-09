#! /usr/bin/env node

let program = require('commander')
let { switchMirror } = require('../lib/')

program.usage('[mirror]')
program.option('--yarn', 'use yarn instead of npm')

program.on('--help', function () {
  console.log(`
    Support mirrors: npm, taobao, cnpm, nj(nodejitsu)
      `)
})

program.parse(process.argv)

let mirror = program.args[0]

if (mirror === '[object Object]') {
  program.help()
} else {
  let useYarn = program.yarn
  switchMirror(mirror, useYarn)
}
