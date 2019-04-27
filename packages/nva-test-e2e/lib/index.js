const { resolve } = require('path')
const createTestCafe = require('testcafe')
const chalk = require('chalk')
const { flatMap } = require('lodash')
const glob = require('glob')
const ip = require('internal-ip')
const qrcode = require('qrcode-terminal')

module.exports = function (confPath, port, browsers = ['chrome']) {
  let conf = {}
  let specs = []
  try {
    conf = require(resolve(confPath))
  } catch (e) {
    console.log(chalk.red('config invalid'))
    process.exit(1)
  }
  if (Array.isArray(conf.spec)) {
    specs = flatMap(conf.spec, v => {
      return glob.sync(v)
    })
  }

  let tc = null
  let runner = null
  const exec = runner => {
    if (typeof conf.process === 'function') {
      runner = conf.process(runner)
    }
    runner = runner.src(specs).browsers(browsers)

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
      remoteConnection.once('ready', () => {
        exec(runner)
      })
    })
}
