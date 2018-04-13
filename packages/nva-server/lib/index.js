const connect = require('connect')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const serveStatic = require('serve-static')
const favicon = require('serve-favicon')
const proxyMiddleware = require('http-proxy-middleware')
const morgan = require('morgan')
const url = require('url')
const compression = require('compression')
const { join, resolve, parse } = require('path')
const historyAPIFallback = require('connect-history-api-fallback')
const assign = require('lodash/assign')
const mockFactory = require('./mock')

function extname(val) {
  let parsed = url.parse(val)
  return parse(parsed.pathname).ext
}

module.exports = options => {
  const {
    content = false,
    rewrites = false,
    cors = false,
    log = true,
    proxy,
    mock = {}
  } = options

  let app = connect()

  app.use(methodOverride())
  if (proxy) {
    Array.isArray(proxy)
      ? proxy.forEach(v =>
        app.use(
          proxyMiddleware(
            v.url,
            assign({}, v.options, { logLevel: 'silent' })
          )
        )
      )
      : app.use(
        proxyMiddleware(
          proxy.url,
          assign({}, proxy.options, { logLevel: 'silent' })
        )
      )
  }
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: false }))
  if (log) {
    app.use(morgan('dev'))
  }
  app.use(compression())

  if (options.favicon) {
    app.use(favicon(options.favicon))
  } else {
    app.use(favicon(join(__dirname, '..', 'asset', 'nva-server.ico')))
  }

  if (mock) {
    app = mockFactory(app, mock)
  }

  if (cors) {
    app.use(function(req, res, next) {
      res.setHeader('Access-Control-Allow-Origin', '*')
      res.setHeader(
        'Access-Control-Allow-Methods',
        'GET,PUT,POST,DELETE,OPTIONS'
      )
      res.setHeader(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, Content-Length, X-Requested-With, Accept, x-csrf-token, origin'
      )
      if (req.method === 'OPTIONS') return res.end()
      next()
    })
  }

  app.use((req, res, next) => {
    let ext = extname(req.url)
    if (ext === '' || ext === '.html') {
      next()
    } else {
      serveStatic(process.cwd(), {
        fallthrough: true
      })(req, res, next)
    }
  })

  if (rewrites) {
    if (Array.isArray(rewrites)) {
      app.use(historyAPIFallback({ rewrites }))
    } else if (typeof rewrites === 'string') {
      app.use(
        historyAPIFallback({
          rewrites: [
            {
              from: /\/(\S+)?$/,
              to: rewrites
            }
          ]
        })
      )
    } else {
      app.use(
        historyAPIFallback({
          disableDotRule: true,
          verbose: false
        })
      )
    }
  }

  if (content) {
    app.use(
      serveStatic(resolve(content), {
        fallthrough: true
      })
    )
  }

  app.use(function(err, req, res, next) {
    res.statusCode = 500
    res.end(err.message)
  })

  return app
}
