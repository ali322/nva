const { join, resolve, posix } = require('path')
const { parse } = require('url')
const isString = require('lodash/isString')
const flatMap = require('lodash/flatMap')
const BrowserSync = require('browser-sync')
const colors = require('colors')
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
    watch,
    onDevProgress,
    logText
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
      const key = posix.join(
        posix.sep,
        relativeURL(resolve(sourceFolder), file)
      )
      bufs[key] = injector(file)
    }
    bus.on('html-changed', changed => {
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
      hooks.beforeDev(
        hotUpdateConfig.length === 1 ? hotUpdateConfig[0] : hotUpdateConfig
      )
    )
  }
  if (typeof beforeDev === 'function') {
    hotUpdateConfig = mergeConfig(
      hotUpdateConfig,
      beforeDev(
        hotUpdateConfig.length === 1 ? hotUpdateConfig[0] : hotUpdateConfig
      )
    )
  }

  // open browser when first build finished
  let openBrowserAfterDev = () => {
    let url = spa ? '/' : '/index/'
    url = `${protocol}://${hostname}:${port}${url}`
    console.log(
      `${emojis('rocket')}  ` +
        colors.yellow(
          logText.serverRunning + ` ${protocol}://${hostname}:${port}`
        )
    )
    if (browser === 'none') return
    openBrowser(browser, url, logText.openBrowserFailed)
  }

  let bundlerFinished = 0
  const middlewares = flatMap(hotUpdateConfig, config =>
    require('../common/middleware')(
      config,
      (err, stats) => {
        bus.emit('develop-bundler-finished')
        if (typeof hooks.afterDev === 'function') {
          hooks.afterDev(err, stats)
        }
        if (typeof afterDev === 'function') {
          afterDev(err, stats)
        }
      },
      profile || onDevProgress
    )
  )
  bus.on('develop-bundler-finished', () => {
    bundlerFinished += 1
    if (bundlerFinished === hotUpdateConfig.length) {
      openBrowserAfterDev()
    }
  })

  let rewrites = spa === true ? '/index.html' : false
  if (isString(spa) || Array.isArray(spa)) {
    rewrites = spa
  }
  const app = require('nva-server')({
    content: (req, res, next) => {
      console.log(req.url)
      let url =
        req.url.endsWith(posix.sep) && rewrites === false
          ? posix.join(req.url, 'index.html')
          : req.url
      url = parse(url)
      if (bufs[url.pathname]) {
        res.setHeader('Content-Type', 'text/html')
        res.end(bufs[url.pathname])
      } else {
        next()
      }
    },
    asset: '.',
    proxy,
    log: false,
    rewrites,
    mock,
    favicon,
    logText
  })

  checkPort(port, hostname, available => {
    if (!available) {
      error(logText.portInvalid)
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
