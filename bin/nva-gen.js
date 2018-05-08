#! /usr/bin/env node

const program = require('commander')
const chalk = require('chalk')
const fs = require('fs-extra')
const ejs = require('ejs')
const { resolve, join } = require('path')
const glob = require('glob')
const map = require('lodash/map')

program.option('-i, --input [input]', 'templates diretory path')
program.option('-o, --output [output]', 'output code directory path')

program.on('--help', function () {
  console.log(`
  Examples:

    ${chalk.cyan(' # generate code from local templates')}
    nva gen --output src/todo --input templates/todo
    
z    `)
})

program.parse(process.argv)
if (!program.args.length) {
  program.help()
}

const input = program.input
const output = program.output
const metaFile = 'meta.js'
const templatePath = 'template'

let meta = {}
const metaPath = resolve(input, metaFile)
if (fs.existsSync(metaPath)) {
  meta = require(metaPath)
}

const templates = glob.sync(join(input, templatePath, '**', '*.*'))

const queue = map(templates, t => {
  const dist = join(output, t.replace(join(input, templatePath), ''))
  return ejs.renderFile(t, meta).then(ret => {
    fs.ensureFileSync(dist)
    return fs.outputFile(dist, ret)
  })
})

Promise.all(queue)
  .then(() => {
    console.log(chalk.yellow(`Successfully generate code in '${output}'`))
  })
  .catch(err => {
    console.error(err)
  })
