import connect from 'connect'
import bodyParser from 'body-parser'
import methodOverride from 'method-override'
import serveStatic from 'serve-static'
import favicon from 'serve-favicon'
import proxyMiddleware from 'http-proxy-middleware'
import morgan from 'morgan'
import compression from 'compression'
import { join, resolve } from 'path'
import fs from 'fs'
import { parse } from 'url'
import historyAPIFallback from 'connect-history-api-fallback'
import mockFactory from './mock'

export default (options) => {
    let { path = '', asset = '', mock = '', rewrites = false, cors = false, log = true, proxy } = options
    let app = connect()

    app.use(methodOverride())
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

    if (proxy) {
        Array.isArray(proxy) ? proxy.forEach(v => app.use(proxyMiddleware(v.url, { ...v.options, logLevel: 'silent' }))) :
            app.use(proxyMiddleware(proxy.url, { ...proxy.options, logLevel: 'silent' }))
    }

    function applyAsset(assetPath, fallthrough = true) {
        app.use(assetPath === '.' ? '' : `/${assetPath}`, function(req, res, next) {
            let parsed = parse(req.url)
            if (parsed.pathname.match(/\.[^html]+$/)) {
                serveStatic(resolve(assetPath), {
                    fallthrough,
                })(req, res, next)
            } else {
                next()
            }
        })
    }

    if (asset) {
        Array.isArray(asset) ? asset.forEach((v, i) => applyAsset(v, i < asset.length - 1)) : applyAsset(asset, true)
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
            let parsed = parse(req.url)
            if (parsed.pathname.match(/\.html$/)) {
                let str
                try {
                    let file = join(path, parsed.pathname)
                    str = fs.readFileSync(file, 'utf8')
                    res.setHeader('Content-Type', 'text/html');
                    res.setHeader('Content-Length', Buffer.byteLength(str));
                    res.end(str)
                } catch (err) {
                    next(err)
                }
            } else {
                next()
            }
        })
    }

    app.use(function(err, req, res, next) {
        res.statusCode = 500
        res.end(err.message)
    })

    return app
}