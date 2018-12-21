const nodemon = require('nodemon')
const colors = require('colors')
const { relative } = require('path')
const { sprintf } = require('nva-util')

module.exports = function(options, logText) {
  const script = nodemon(options)

  let exitHanlder = function(options) {
    if (options.exit) script.emit('exit')
    if (options.quit) process.exit(0)
  }

  process.once('exit', exitHanlder.bind(null, { exit: true }))
  process.once('SIGINT', exitHanlder.bind(null, { quit: true }))

  script
    .on('crash', function() {
      console.log(colors.red(logText.serverCrashed))
    })
    .on('quit', function() {
      process.exit()
    })
    .on('restart', function(files) {
      files.forEach(function(file) {
        let path = relative(process.cwd(), file)
        console.log(colors.yellow(sprintf(logText.fileChanged, [path])))
      })
      console.log(colors.yellow(logText.serverRestart))
    })

  return script
}
