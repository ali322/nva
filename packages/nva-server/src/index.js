import connect from 'connect'
import bodyParser from 'body-parser'
import methodOverride from 'method-override'
import serveStatic from 'serve-static'
import favicon from 'serve-favicon'
import proxyMiddleware from 'http-proxy-middleware'
import morgan from 'morgan'
import compression from 'compression'
import { join, resolve, parse, posix } from 'path'
import { parse as urlParse } from 'url'
import historyAPIFallback from 'connect-history-api-fallback'
import mockFactory from './mock'

function extname(val) {
    let parsed = urlParse(val)
    return parse(parsed.pathname).ext
}

export default (options) => {
    let { path = '', asset = '', rewrites = false, cors = false, log = true, proxy, mock = {} } = options
    let app = connect()

    app.use(methodOverride())
    if (proxy) {
        Array.isArray(proxy) ? proxy.forEach(v => app.use(proxyMiddleware(v.url, { ...v.options, logLevel: 'silent' }))) :
            app.use(proxyMiddleware(proxy.url, { ...proxy.options, logLevel: 'silent' }))
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
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, Accept, x-csrf-token, origin');
            if ('OPTIONS' == req.method) return res.end();
            next()
        })
    }


    function applyAsset(assetPath, fallthrough = true) {
        app.use(assetPath === '.' ? '' : `/${assetPath}`, function(req, res, next) {
            if (extname(req.url) !== '.html') {
                serveStatic(resolve(assetPath), {
                    fallthrough,
                })(req, res, next)
            } else {
                next()
            }
        })
    }

    if (asset) {
        Array.isArray(asset) ? asset.forEach((v, i) => applyAsset(v, i < asset.length - 1)) : applyAsset(asset, false)
    }

    if (rewrites) {
        if (Array.isArray(rewrites)) {
            app.use(historyAPIFallback({ rewrites }))
        } else if (typeof rewrites === 'string') {
            app.use(historyAPIFallback({
                rewrites: [{
                    from: /\/(\S+)?$/,
                    to: rewrites
                }]
            }))
        } else {
            app.use(historyAPIFallback({
                verbose: false
            }))
        }
    }

    if (path) {
        app.use(function(req, res, next) {
            let ext = extname(req.url)
            if (ext === '.html' || req.url.endsWith(posix.sep)) {
                serveStatic(resolve(path), {
                    fallthrough: false,
                })(req, res, next)
            } else {
                next()
            }
        })
    }

    app.use(function(req, res) {
        res.statusCode = 404
        res.end('not found')
    })

    app.use(function(err, req, res, next) {
        res.statusCode = 500
        res.end(err.message)
    })

    return app
}