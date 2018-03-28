let BrowserSync = require('browser-sync')
let nodemon = require('./nodemon')
let { join, dirname } = require('path')
let createApp = require('nva-server')
let { mergeConfig, openBrowser } = require('../common')
let { merge } = require('../common/helper')
let middlewareFactory = require('../common/middleware')
let hotUpdateConfigFactory = require('./webpack.hot-update')
let bus = require('./event-bus')

module.exports = function(context) {
  const {
    runningMessage,
    serverFolder,
    serverCompile,
    serverEntry,
    viewFolder,
    distFolder,
    beforeDev,
    mock,
    afterDev,
    hooks,
    startWatcher
  } = context
  const RUNNING_REGXP = new RegExp(runningMessage || 'server is running')
  return function(options) {
    startWatcher()

    let browserSync = BrowserSync.create()
    process.once('SIGINT', () => {
      browserSync.exit()
      process.exit(0)
    })
    const port = options.port || 7000
    const proxyPort = context.port || 3000

    let opened = 0
    let openBrowserAfterDev = () => {
      let url = `http://localhost:${proxyPort}`
      openBrowser(options.browser, url)
    }

    let startNode = () => {
      nodemon({
        // delay: "200ms",
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
        verbose: false,
        stdout: false,
        // ignore: ["*"],
        watch: [serverFolder, serverEntry, join(distFolder, serverFolder)],
        ext: 'js html json es6'
      }).on('readable', function() {
        this.stdout.on('data', chunk => {
          if (RUNNING_REGXP.test(chunk.toString())) {
            if (opened === 0) {
              opened += 1
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
    bus.once('client-build-finished', () => {
      clientBuildFinished = true
      serverBuildFinished && startNode()
    })

    let app = createApp({
      log: false,
      cors: true,
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
      }
    })
    let middleware = [app]
    let hotUpdateConfig = hotUpdateConfigFactory(
      merge(context, { port }),
      options.profile
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
      middlewareFactory(
        hotUpdateConfig,
        () => {
          if (typeof hooks.afterDev === 'function') {
            hooks.afterDev()
          }
          if (typeof afterDev === 'function') {
            afterDev()
          }
          bus.emit('client-build-finished')
        },
        options.profile
      )
    )

    browserSync.init(
      {
        proxy: {
          target: 'http://localhost:' + proxyPort,
          middleware
        },
        port,
        files: join(viewFolder, '*.html'),
        online: false,
        logLevel: 'silent',
        notify: true,
        open: false,
        // reloadOnRestart:true,
        // browser: "google chrome",
        socket: {
          clientPath: '/bs'
        },
        scriptPath: function(path) {
          path = path.replace(
            /browser-sync-client(\.\d+)+/,
            'browser-sync-client'
          )
          return 'http://localhost:' + port + path
        }
      },
      function() {
        // console.log('🚀  develop server is started at %d', proxyPort);
      }
    )
  }
}
