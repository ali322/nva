const { join, resolve, posix } = require('path')
const { parse } = require('url')
const isString = require('lodash/isString')
const BrowserSync = require('browser-sync')
const { error, checkPort, emojis, merge, relativeURL } = require('nva-util')
const { mergeConfig, openBrowser } = require('../common')
const bus = require('../common/event-bus')

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
    proxy,
    strict,
    watch
  } = context

  const { protocol, hostname, port, browser, profile } = options

  startWatcher(strict)

  const browserSync = BrowserSync.create()
  process.once('SIGINT', () => {
    browserSync.exit()
    process.exit(0)
  })
  const bufs = {}
  const afterInject = (filename, injector) => {
    const injectTo = file => {
      const key = posix.join(posix.sep, relativeURL(resolve(sourceFolder), file))
      bufs[key] = injector(file)
    }
    bus.on('html-changed', (changed) => {
      injectTo(changed)
    })
    injectTo(filename)
  }
  let hotUpdateConfig = require('./webpack.hot-update')(
    merge(context, { afterInject }),
    profile
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
    url = `${protocol}://${hostname}:${port}${url}`
    console.log(
      `${emojis('rocket')}  server running at ${protocol}://${hostname}:${port}`
    )
    if (browser === 'none') return
    openBrowser(browser, url)
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
    profile
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
    content: (req, res, next) => {
      let url =
        req.url.endsWith(posix.sep) && rewrites === false
          ? posix.join(req.url, 'index.html')
          : req.url
      url = parse(url)
      res.setHeader('Content-Type', 'text/html')
      res.end(bufs[url.pathname])
    },
    asset: '.',
    proxy,
    log: false,
    rewrites,
    mock,
    favicon
  })

  checkPort(port, hostname, available => {
    if (!available) {
      error('port is not avaiilable')
    } else {
      browserSync.init({
        https: protocol === 'https',
        host: hostname !== 'localhost' ? hostname : null,
        port,
        // server: spa ? false : [sourceFolder, distFolder],
        middleware: middlewares.concat([app]),
        files: [
          {
            match: join(sourceFolder, '**', '*.html'),
            fn(evt, file) {
              bus.emit('html-changed', file)
              browserSync.reload({ stream: false })
            }
          }
        ],
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
      })
      browserSync.watch([mock, watch], (evt, file) => {
        browserSync.reload({ stream: false })
      })
    }
  })
}
