let { existsSync } = require('fs')
let { resolve } = require('path')
let createTestCafe = require('testcafe')
let chalk = require('chalk')
let ip = require('internal-ip')
let qrcode = require('qrcode-terminal')

module.exports = function (conf, port, browsers = ['chrome']) {
  try {
    conf = require(resolve(conf))
  } catch (e) {
    console.log(chalk.red('config invalid'))
    process.exit(1)
  }

  let exec = runner => {
    if (typeof conf.process === 'function') {
      runner = conf.process(runner)
    }
    runner = runner
      .src(conf.spec || [])
      .browsers(browsers)


    runner
      .run()
      .then(cnt => {
        tc.close()
      })
      .catch(err => {
        console.log(err)
        tc.close()
      })
  }

  let tc = null
  let runner = null
  createTestCafe(ip.v4.sync(), port)
    .then(testCafe => {
      tc = testCafe
      runner = testCafe.createRunner()
      exec(runner)
      return tc.createBrowserConnection()
    })
    .then(remoteConnection => {
      console.log(chalk.yellow('scan qrcode below to test on remote device'))
      qrcode.generate(remoteConnection.url, { small: true })
      console.log('')
      //   console.log(remoteConnection.url)
      remoteConnection.once('ready', () => {
        exec(runner)
      })
    })
}
