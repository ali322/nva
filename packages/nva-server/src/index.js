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

    if(paths){
        paths = paths.split(',')
        paths.forEach(v => {
            app.use(serveStatic(v, {
                extensions: ['html', 'htm'],
                setHeaders: customHeader
            }))
        })
    }

    function customHeader(res, path) {
        if (serveStatic.mime.lookup(path) === 'text/html') {
            res.setHeader('Cache-Control', 'public,maxAge=0')
        }
    }

    if(asset){
        app.use(serveStatic(asset,{
            fallthrough: false
        }))
    }

    app.use(favicon(path.join(__dirname,'..','asset','favicon.ico')))

    if (fs.existsSync(options.mockPath)) {
        app = mock(app, mockPath)
    }

    app.use(function(err, req, res, next) {
        res.statusCode = 500
        res.end(err.message)
    })

    return app
}