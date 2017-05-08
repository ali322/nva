import { join, sep } from 'path'
import middlewareFactory from '../lib/middleware'
import { mergeConfig, openBrowser } from '../lib/'
import hotUpdateConfig from './webpack.hot-update'
import BrowserSync from 'browser-sync'
import createApp from 'nva-server'

export default function(context, constants) {
    const { spa, moduleConf, sourceFolder, distFolder, bundleFolder, mockConf, beforeDev,afterDev } = context
    return function(options) {
        let browserSync = BrowserSync.create()
        const port = options.port || 3000
        let config = hotUpdateConfig({ ...context, port }, constants)
        if (typeof beforeDev === 'function') {
            config = mergeConfig(config, beforeDev(config))
        }
        const middlewares = middlewareFactory(config, () => {
            if(typeof afterDev === 'function'){
                afterDev()
            }
            let url = spa ? '/' : '/index'
            url = `http://localhost:${port}${url}`
            openBrowser(options.browser, url)
        })

        let rewrites = spa === true ? [{
            from: /\/(\S+)?$/,
            to: moduleConf['index'] ? join(sep, moduleConf['index'].path, moduleConf['index'].html[0]) : '/index.html'
        }] : false
        if (typeof spa === 'object') {
            rewrites = spa
        }

        const app = createApp({
            asset: spa ? distFolder : false,
            path: spa ? join(sourceFolder, bundleFolder) : false,
            log: false,
            rewrites,
            mockConf
        })

        process.once('SIGINT', () => {
            browserSync.exit()
            process.exit(0)
        })

        browserSync.init({
            port,
            server: spa ? false : [join(sourceFolder, bundleFolder), distFolder],
            middleware: middlewares.concat([app]),
            files: [join(sourceFolder, bundleFolder, '**', '*.html')],
            online: false,
            notify: true,
            open: false,
            watchOptions: {
                debounceDelay: 1000
            },
            ghostMode: {
                clicks: true,
                forms: true,
                scroll: true
            },
            logFileChanges: true,
            logConnections: false,
            logLevel: "silent"
        }, function() {
            console.log('🌎  develop server started at %d', port)
        })
    }
}