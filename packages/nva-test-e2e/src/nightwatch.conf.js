let { resolve, join } = require('path')
let argv = require('yargs').argv

let customize = {
  src_folders: [resolve('test', 'e2e', 'spec')],
  output_folder: resolve('test', 'e2e', 'report')
}
if (argv.customize) {
  customize = require(argv.customize)
}

module.exports = (function (settings) {
  settings.globals_path = join(__dirname, 'global.js')
  settings.selenium = {
    start_process: true,
    server_path: require('selenium-server').path,
    host: '127.0.0.1',
    port: 6666,
    cli_args: {
      'webdriver.chrome.driver': require('chromedriver').path
    }
  }

  settings.test_settings = {
    default: {
      selenium_port: 6666,
      selenium_host: 'localhost',
      silent: true
    },
    chrome: {
      desiredCapabilities: {
        browserName: 'chrome',
        javascriptEnabled: true,
        acceptSslCerts: true
      }
    }
  }
  return settings
})(customize)
