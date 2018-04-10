#! /usr/bin/env node

const program = require('commander')
const { switchMirror } = require('../lib/')

program.usage('[mirror]')
program.option('--yarn', 'use yarn instead of npm')

program.on('--help', function () {
  console.log(`
    Support mirrors: npm, taobao, cnpm, nj(nodejitsu)
      `)
})

program.parse(process.argv)

const mirror = program.args[0]

if (mirror === '[object Object]') {
  program.help()
} else {
  const useYarn = program.yarn
  switchMirror(mirror, useYarn)
}
