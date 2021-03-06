const BrowserSync = require('browser-sync')
const nodemon = require('./nodemon')
const flatMap = require('lodash/flatMap')
const { join } = require('path')
const { mergeConfig, openBrowser } = require('../common')
const { merge } = require('nva-util')
const bus = require('../common/event-bus')

module.exports = function(context, options) {
  const {
    serverFolder,
    serverCompile,
    serverCompiler,
    beforeDev,
    mock,
    afterDev,
    hooks,
    startWatcher,
    strict,
    watch,
    onDevProgress,
    logText
  } = context

  options = Object.assign(
    {},
    {
      protocol: 'http',
      hostname: 'localhost',
      port: 3000,
      clientPort: 7000,
      browser: 'default',
      profile: false
    },
    options
  )

  const { protocol, hostname, port, clientPort, browser, profile } = options

  const RUNNING_REGXP = new RegExp(logText.serverRunning)
  if (startWatcher) {
    startWatcher(strict)
  }

  const browserSync = BrowserSync.create()
  process.once('SIGINT', () => {
    browserSync.exit()
    process.exit(0)
  })

  let started = 0
  let openBrowserAfterDev = () => {
    if (browser === 'none') return
    let url = `${protocol}://${hostname}:${port}`
    openBrowser(browser, url, logText.openBrowserFailed)
  }

  const startNode = () => {
    nodemon({
      delay: '200ms',
      script: join(__dirname, 'proxy-server.js'),
      env: {
        context: JSON.stringify(context),
        options: JSON.stringify(options)
      },
      execMap: serverCompile
        ? {
          js: serverCompiler
        }
        : {},
      verbose: true,
      stdout: false,
      legacyWatch: true,
      watch: [serverFolder],
      ext: 'js html json es6'
    }, logText).on('readable', function() {
      this.stdout.on('data', chunk => {
        if (RUNNING_REGXP.test(chunk.toString())) {
          if (started === 0) {
            started += 1
            openBrowserAfterDev()
          }
          browserSync.reload({
            stream: false
          })
        }
      })
      this.stdout.pipe(process.stdout)
      this.stderr.pipe(process.stderr)
    })
  }

  let clientBuildFinished = false
  let serverBuildFinished = false
  bus.once('server-build-finished', () => {
    serverBuildFinished = true
    clientBuildFinished && startNode()
  })

  let hotUpdateConfig = require('./webpack.hot-update')(
    merge(context, { port: clientPort }),
    profile
  )
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
  let bundlerFinished = 0
  bus.on('client-build-finished', () => {
    bundlerFinished += 1
    if (bundlerFinished === hotUpdateConfig.length) {
      clientBuildFinished = true
      serverBuildFinished && startNode()
    }
  })
  const app = require('nva-server').mock(mock)
  let middleware = [app]
  middleware = middleware.concat(
    flatMap(hotUpdateConfig, config =>
      require('../common/middleware')(
        config,
        (err, stats) => {
          if (typeof hooks.afterDev === 'function') {
            hooks.afterDev(err, stats)
          }
          if (typeof afterDev === 'function') {
            afterDev(err, stats)
          }
          bus.emit('client-build-finished')
        },
        profile || onDevProgress
      )
    )
  )

  browserSync.init({
    // proxy: {
    //   target: `${protocol}://${hostname}:${port}`
    // },
    middleware,
    port: clientPort,
    cors: true,
    // files: join(viewFolder, '*.html'),
    online: false,
    logLevel: 'silent',
    notify: true,
    open: false,
    reloadOnRestart: true,
    // browser: "google chrome",
    socket: {
      clientPath: '/bs'
    }
  })

  browserSync.watch([mock || [], watch], (evt, file) => {
    browserSync.reload({ stream: false })
  })
}
