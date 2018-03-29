let { join } = require('path')
let isString = require('lodash/isString')
let BrowserSync = require('browser-sync')
let { error, checkPort, emojis, merge } = require('../common/helper')
let { mergeConfig, openBrowser } = require('../common')

module.exports = (context, options) => {
  const {
    spa,
    sourceFolder,
    distFolder,
    staticFolder,
    mock,
    beforeDev,
    afterDev,
    hooks,
    startWatcher,
    favicon,
    proxy
  } = context

  startWatcher()

  let browserSync = BrowserSync.create()
  process.once('SIGINT', () => {
    browserSync.exit()
    process.exit(0)
  })
  const port = options.port || 3000
  let hotUpdateConfig = require('./webpack.hot-update')(merge(context, { port }), options.profile)

  // apply before hooks
  if (typeof hooks.beforeDev === 'function') {
    hotUpdateConfig = mergeConfig(hotUpdateConfig, hooks.beforeDev(hotUpdateConfig))
  }
  if (typeof beforeDev === 'function') {
    hotUpdateConfig = mergeConfig(hotUpdateConfig, beforeDev(hotUpdateConfig))
  }

  // open browser when first build finished
  let opened = 0
  let openBrowserAfterDev = () => {
    let url = spa ? '/' : '/index/'
    url = `http://localhost:${port}${url}`
    openBrowser(options.browser, url)
    console.log(`${emojis('rocket')}  develop server started at ${port}`)
  }

  const middlewares = require('../common/middleware')(
    hotUpdateConfig,
    () => {
      if (typeof hooks.afterDev === 'function') {
        hooks.afterDev()
      }
      if (typeof afterDev === 'function') {
        afterDev()
      }
      if (opened === 0) {
        opened += 1
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
    asset: [distFolder, staticFolder],
    path: sourceFolder,
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

  checkPort(port, available => {
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
