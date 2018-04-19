const nodemon = require('nodemon')
const chalk = require('chalk')
const { relative } = require('path')

module.exports = function(options) {
  const script = nodemon(options)

  let exitHanlder = function(options) {
    if (options.exit) script.emit('exit')
    if (options.quit) process.exit(0)
  }

  process.once('exit', exitHanlder.bind(null, { exit: true }))
  process.once('SIGINT', exitHanlder.bind(null, { quit: true }))

  script
    .on('crash', function() {
      console.log(chalk.red('server has crashed'))
    })
    .on('quit', function() {
      process.exit()
    })
    .on('restart', function(files) {
      files.forEach(function(file) {
        file = relative(process.cwd(), file)
        console.log(chalk.yellow(`file ${file} changed`))
      })
      console.log(chalk.yellow(`server restarting...`))
    })

  return script
}
