const { resolve } = require('path')
const createTestCafe = require('testcafe')
const chalk = require('chalk')
const ip = require('internal-ip')
const qrcode = require('qrcode-terminal')

module.exports = function (confPath, port, browsers = ['chrome']) {
  let conf = {}
  try {
    conf = require(resolve(confPath))
  } catch (e) {
    console.log(chalk.red('config invalid'))
    process.exit(1)
  }

  let tc = null
  let runner = null
  const exec = runner => {
    if (typeof conf.process === 'function') {
      runner = conf.process(runner)
    }
    runner = runner.src(conf.spec || []).browsers(browsers)

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
