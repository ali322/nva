import connect from 'connect'
import serveStatic from 'serve-static'
import favicon from 'serve-favicon'
import path from 'path'
import fs from 'fs'
import mock from './mock'

export default (options = {
    paths: 'html',
    asset: 'asset'
}) => {
    let { paths, asset, mockPath } = options
    let app = connect()

    app.use(favicon(path.join(__dirname, '..', 'asset', 'favicon.ico')))

    const serveAsset = serveStatic(asset, {
        fallthrough: false
    })

    const servePage = serveStatic(paths, {
        extensions: ['html', 'htm'],
        setHeaders: customHeader
    })

    app.use(function(req, res, next) {
        if (/(\.[^html]+$)/.test(req.url)) {
            serveAsset(req, res, next)
        } else {
            servePage(req, res, next)
        }
    })

    function customHeader(res, path) {
        if (serveStatic.mime.lookup(path) === 'text/html') {
            res.setHeader('Cache-Control', 'public,maxAge=0')
        }
    }

    if (fs.existsSync(options.mockPath)) {
        app = mock(app, mockPath)
    }

    app.use(function(err, req, res, next) {
        res.statusCode = 500
        res.end(err.message)
    })

    return app
}