const BrowserSync = require('browser-sync')
const nodemon = require('./nodemon')
const { join, dirname } = require('path')
const { mergeConfig, openBrowser } = require('../common')
const { merge } = require('../common/helper')
const bus = require('./event-bus')

module.exports = function(context, options) {
  const {
    runningMessage,
    serverFolder,
    serverCompile,
    serverEntry,
    beforeDev,
    mock,
    clientPort,
    afterDev,
    hooks,
    startWatcher,
    strict
  } = context

  const { protocol, hostname, port, browser, profile } = options

  const RUNNING_REGXP = new RegExp(runningMessage || 'server is running at')
  startWatcher(strict)

  const browserSync = BrowserSync.create()
  process.once('SIGINT', () => {
    browserSync.exit()
    process.exit(0)
  })

  let opened = 0
  let started = 0
  let openBrowserAfterDev = () => {
    let url = `${protocol}://${hostname}:${port}`
    openBrowser(browser, url)
  }

  const startNode = () => {
    nodemon({
      restartable: 'rs',
      delay: '200ms',
      script: serverEntry,
      execMap: serverCompile
        ? {
          js: join(
              dirname(require.resolve('babel-cli')),
              '..',
              '.bin',
              'babel-node'
            )
        }
        : {},
      verbose: true,
      stdout: false,
      legacyWatch: true,
      watch: [serverFolder, serverEntry],
      ext: 'js html json es6'
    }).on('readable', function() {
      this.stdout.on('data', chunk => {
        if (RUNNING_REGXP.test(chunk.toString())) {
          if (started === 0) {
            started += 1
            this.started = started
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

  bus.once('server-build-finished', () => {
    startNode()
  })

  const app = require('nva-server').mock({
    path: mock,
    onChange(path) {
      browserSync.reload({ stream: false })
    },
    onAdd(path) {
      browserSync.reload({ stream: false })
    },
    onRemove(path) {
      browserSync.reload({ stream: false })
    }
  })
  let middleware = [app]
  let hotUpdateConfig = require('./webpack.hot-update')(
    merge(context, { port: clientPort }),
    profile
  )
  if (typeof hooks.beforeDev === 'function') {
    hotUpdateConfig = mergeConfig(
      hotUpdateConfig,
      hooks.beforeDev(hotUpdateConfig)
    )
  }
  if (typeof beforeDev === 'function') {
    hotUpdateConfig = mergeConfig(hotUpdateConfig, beforeDev(hotUpdateConfig))
  }
  middleware = middleware.concat(
    require('../common/middleware')(
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
        }
      },
      profile
    )
  )

  browserSync.init(
    {
      proxy: {
        target: `${protocol}://${hostname}:${port}`,
        middleware
      },
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
    },
    function() {
      // console.log('🚀  develop server is started at %d', proxyPort);
    }
  )
}
