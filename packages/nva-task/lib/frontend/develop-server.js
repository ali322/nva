const { join } = require('path')
const isString = require('lodash/isString')
const BrowserSync = require('browser-sync')
const { error, checkPort, emojis } = require('../common/helper')
const { mergeConfig, openBrowser } = require('../common')

module.exports = (context, options) => {
  const {
    spa,
    sourceFolder,
    mock,
    beforeDev,
    afterDev,
    hooks,
    startWatcher,
    favicon,
    proxy
  } = context

  startWatcher()

  const browserSync = BrowserSync.create()
  process.once('SIGINT', () => {
    browserSync.exit()
    process.exit(0)
  })
  const hostname = options.hostname
  const port = options.port
  let hotUpdateConfig = require('./webpack.hot-update')(
    context,
    options.profile
  )

  // apply before hooks
  if (typeof hooks.beforeDev === 'function') {
    hotUpdateConfig = mergeConfig(
      hotUpdateConfig,
      hooks.beforeDev(hotUpdateConfig)
    )
  }
  if (typeof beforeDev === 'function') {
    hotUpdateConfig = mergeConfig(hotUpdateConfig, beforeDev(hotUpdateConfig))
  }

  // open browser when first build finished
  let opened = 0
  let openBrowserAfterDev = () => {
    let url = spa ? '/' : '/index/'
    url = `http://${hostname}:${port}${url}`
    openBrowser(options.browser, url)
    console.log(`${emojis('rocket')}  develop server started at ${hostname}:${port}`)
  }

  const middlewares = require('../common/middleware')(
    hotUpdateConfig,
    (err, stats) => {
      if (opened === 0) {
        opened += 1
        if (typeof hooks.afterDev === 'function') {
          hooks.afterDev(err, stats)
        }
        if (typeof afterDev === 'function') {
          afterDev(err, stats)
        }
        openBrowserAfterDev()
      }
    },
    options.profile
  )

  let rewrites =
    spa === true
      ? [
        {
          from: /\/(\S+)?$/,
          to: '/index.html'
        }
      ]
      : false
  if (isString(spa) || Array.isArray(spa)) {
    rewrites = spa
  }
  const app = require('nva-server')({
    content: sourceFolder,
    proxy,
    log: false,
    rewrites,
    mock: {
      path: mock,
      onChange(path) {
        console.log(`file ${path} changed`)
        browserSync.reload({ stream: false })
      },
      onAdd(path) {
        console.log(`file ${path} added`)
        browserSync.reload({ stream: false })
      },
      onRemove(path) {
        console.log(`file ${path} removed`)
        browserSync.reload({ stream: false })
      }
    },
    favicon
  })

  checkPort(port, hostname, available => {
    if (!available) {
      error('port is not avaiilable')
    } else {
      browserSync.init(
        {
          port,
          // server: spa ? false : [sourceFolder, distFolder],
          middleware: middlewares.concat([app]),
          files: [join(sourceFolder, '**', '*.html')],
          online: false,
          notify: true,
          open: false,
          reloadOnRestart: true,
          watchOptions: {
            debounceDelay: 1000
          },
          ghostMode: {
            clicks: true,
            forms: true,
            scroll: true
          },
          logFileChanges: true,
          logConnections: false,
          logLevel: 'silent'
        },
        function() {}
      )
    }
  })
}
