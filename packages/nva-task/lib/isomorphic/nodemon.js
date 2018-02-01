let nodemon = require('nodemon')
let chalk = require('chalk')
let { emojis } = require('../common/helper')
let { relative } = require('path')

module.exports = function (options) {
  let script = nodemon(options),
    started = false

  let exitHanlder = function (options) {
    if (options.exit) script.emit('exit')
    if (options.quit) process.exit(0)
  }

  process.once('exit', exitHanlder.bind(null, { exit: true }))
  process.once('SIGINT', exitHanlder.bind(null, { quit: true }))

  script.on('restart', function (files) {
    console.log(`${emojis('rocket')}  ` + chalk.yellow('server restarting...'))
    files.forEach(function (file) {
      file = relative(process.cwd(), file)
      console.log(chalk.yellow(`file ${file} changed`))
    })
  })

  script.on('start', function () {
    if (!started) {
      return
    }
    started = true
  })

  return script
}
