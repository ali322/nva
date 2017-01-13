#! /usr/bin/env node

var program = require("commander")
var chalk = require("chalk")

// program.option("-p, --port [value]","dev server listen port")

// program.on('--help',function(){
//     console.log(`
//   Examples:

//     ${chalk.cyan(' # start dev server at specified port')}
//     nva dev -p 5000

//     `)
// })

// program.parse(process.argv)

// if(!program.args.length){
//     program.help()
// }

var port = program.port

var tasks = require('../task')

tasks.vendor()