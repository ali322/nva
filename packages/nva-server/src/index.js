import connect from 'connect'
import serveStatic from 'serve-static'
import morgan from 'morgan'
import compression from 'compression'
import path from 'path'
import fs from 'fs'
import url from 'url'
import mock from './mock'
import historyAPIFallback from 'connect-history-api-fallback'

export default (options = {
    paths: 'html',
    cors: false,
    log: true,
    rewrites: false,
    asset: 'asset'
}) => {
    let { paths, rewrites, asset, mockPath, cors, log } = options
    let app = connect()

    if (rewrites) {
        if (typeof rewrites === 'object') {
            app.use(historyAPIFallback(rewrites))
        } else {
            app.use(historyAPIFallback({
                verbose: false
            }))
        }
    }

    if (log) {
        app.use(morgan('dev'))
    }
    app.use(compression())

    if (cors) {
        app.use(function(req, res, next) {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, Accept, x-csrf-token, origin');
            if ('OPTIONS' == req.method) return res.end();
            next()
        })
    }

    const serveAsset = serveStatic(asset, {
        fallthrough: false
    })

    app.use(function(req, res, next) {
        if (/(\.[^html]+$)/.test(req.url)) {
            serveAsset(req, res, next)
        } else {
            let file = path.join(paths, url.parse(req.url).pathname)
            fs.readFile(file, 'utf8', function(err, str) {
                if (err) return next(err)
                res.setHeader('Content-Type', 'text/html');
                res.setHeader('Content-Length', Buffer.byteLength(str));
                res.end(str)
            })
        }
    })

    if (fs.existsSync(options.mockPath)) {
        app = mock(app, mockPath)
    }

    app.use(function(err, req, res, next) {
        res.statusCode = 500
        res.end(err.message)
    })

    return app
}