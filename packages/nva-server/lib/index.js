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
const isString = require('lodash/isString')
const isFunction = require('lodash/isFunction')
const mockMiddleware = require('./mock')

function extname(val) {
  let parsed = url.parse(val)
  return parse(parsed.pathname).ext
}

const createServer = options => {
  const {
    content = false,
    asset = false,
    rewrites = false,
    cors = false,
    log = true,
    proxy,
    mock = false,
    logText = {}
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
    app.use(mockMiddleware(mock, logText))
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

  function applyAsset(assetPath, fallthrough = true) {
    app.use(function(req, res, next) {
      let ext = extname(req.url)
      if (ext === '' || ext === '.html') {
        next()
      } else {
        serveStatic(resolve(assetPath), {
          fallthrough
        })(req, res, next)
      }
    })
  }

  if (rewrites) {
    if (Array.isArray(rewrites)) {
      app.use(
        historyAPIFallback({ disableDotRule: true, verbose: false, rewrites })
      )
    } else if (typeof rewrites === 'string') {
      app.use(
        historyAPIFallback({
          disableDotRule: true,
          verbose: false,
          rewrites: [
            {
              // from: /\/(\S+)?$/,
              from: /^(?!\/(\S+)?\.\w+)/,
              to: rewrites
            }
          ]
        })
      )
    } else {
      app.use(
        historyAPIFallback({
          disableDotRule: true,
          verbose: false,
          rewrites: [
            {
              // from: /\/(\S+)?$/,
              from: /^(?!\/(\S+)?\.\w+)/,
              to: './index.html'
            }
          ]
        })
      )
    }
  }

  if (content) {
    if (isString(content)) {
      app.use(
        serveStatic(resolve(content), {
          fallthrough: false
        })
      )
    } else if (isFunction(content)) {
      app.use(content)
    }
  }

  if (asset) {
    Array.isArray(asset)
      ? asset.forEach((v, i) => applyAsset(v, i < asset.length - 1))
      : applyAsset(asset, false)
  }

  app.use(function(err, req, res, next) {
    res.statusCode = 500
    res.end(err.message)
  })

  return app
}

createServer.mock = mockMiddleware

module.exports = createServer
