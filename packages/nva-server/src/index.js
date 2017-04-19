import connect from 'connect'
import serveStatic from 'serve-static'
import favicon from 'serve-favicon'
import morgan from 'morgan'
import compression from 'compression'
import { join } from 'path'
import fs from 'fs'
import { parse } from 'url'
import mock from './mock'
import historyAPIFallback from 'connect-history-api-fallback'

export default (options) => {
    let { path = '', asset = '', mockConf = '', rewrites = false, cors = false, log = true } = options
    let app = connect()

    if (log) {
        app.use(morgan('dev'))
    }
    app.use(compression())

    if (options.favicon) {
        app.use(favicon(options.favicon))
    } else {
        app.use(favicon(join(__dirname, '..', 'asset', 'nva-server.ico')))
    }

    if (mockConf && fs.existsSync(mockConf)) {
        app = mock(app, mockConf)
    }

    if (rewrites) {
        if (Array.isArray(rewrites)) {
            app.use(historyAPIFallback({ rewrites }))
        } else {
            app.use(historyAPIFallback({
                verbose: false
            }))
        }
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

    app.use(function(req, res, next) {
        if (/(\.[a-z|A-Z|0-9]+$)/.test(req.url) && asset) {
            serveStatic(asset, {
                fallthrough: false,
                extensions: ['html', 'htm']
            })(req, res, next)
        } else if (path && rewrites) {
            let file = join(path, parse(req.url).pathname)
            fs.readFile(file, 'utf8', function(err, str) {
                if (err) return next(err)
                res.setHeader('Content-Type', 'text/html');
                res.setHeader('Content-Length', Buffer.byteLength(str));
                res.end(str)
            })
        } else {
            next()
        }
    })

    app.use(function(err, req, res, next) {
        res.statusCode = 500
        res.end(err.message)
    })

    return app
}