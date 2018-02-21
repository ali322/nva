let connect = require('connect')
let bodyParser = require('body-parser')
let methodOverride = require('method-override')
let serveStatic = require('serve-static')
let favicon = require('serve-favicon')
let proxyMiddleware = require('http-proxy-middleware')
let morgan = require('morgan')
let compression = require('compression')
let { join, resolve, parse, posix } = require('path')
let url = require('url')
let historyAPIFallback = require('connect-history-api-fallback')
let assign = require('lodash/assign')
let mockFactory = require('./mock')

function extname(val) {
  let parsed = url.parse(val)
  return parse(parsed.pathname).ext
}

module.exports = options => {
  let {
    path = "",
    asset = "",
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
        app.use(proxyMiddleware(v.url, assign({}, v.options, { logLevel: "silent" })))
      )
      : app.use(
        proxyMiddleware(proxy.url, assign({}, proxy.options, { logLevel: "silent" }))
      )
  }
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: false }))
  if (log) {
    app.use(morgan("dev"))
  }
  app.use(compression())

  if (options.favicon) {
    app.use(favicon(options.favicon))
  } else {
    app.use(favicon(join(__dirname, "..", "asset", "nva-server.ico")))
  }

  if (mock) {
    app = mockFactory(app, mock)
  }

  if (cors) {
    app.use(function (req, res, next) {
      res.setHeader("Access-Control-Allow-Origin", "*")
      res.setHeader(
        "Access-Control-Allow-Methods",
        "GET,PUT,POST,DELETE,OPTIONS"
      )
      res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization, Content-Length, X-Requested-With, Accept, x-csrf-token, origin"
      )
      if (req.method === "OPTIONS") return res.end()
      next()
    })
  }

  function applyAsset(assetPath, fallthrough = true) {
    app.use(assetPath === "." ? "" : `/${assetPath}`, function (req, res, next) {
      if (extname(req.url) !== ".html") {
        serveStatic(resolve(assetPath), {
          fallthrough
        })(req, res, next)
      } else {
        next()
      }
    })
  }

  if (asset) {
    Array.isArray(asset)
      ? asset.forEach((v, i) => applyAsset(v, i < asset.length - 1))
      : applyAsset(asset, false)
  }

  if (rewrites) {
    if (Array.isArray(rewrites)) {
      app.use(historyAPIFallback({ rewrites }))
    } else if (typeof rewrites === "string") {
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
          verbose: false
        })
      )
    }
  }

  if (path) {
    app.use(function (req, res, next) {
      let ext = extname(req.url)
      if (ext === ".html" || req.url.endsWith(posix.sep)) {
        serveStatic(resolve(path), {
          fallthrough: false
        })(req, res, next)
      } else {
        next()
      }
    })
  }

  app.use(function (err, req, res, next) {
    res.statusCode = 500
    res.end(err.message)
  })

  return app
}