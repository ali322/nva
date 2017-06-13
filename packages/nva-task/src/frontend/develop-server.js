import { join } from 'path'
import { isString } from 'lodash'
import middlewareFactory from '../lib/middleware'
import { error, checkPort } from '../lib/helper'
import { mergeConfig, openBrowser } from '../lib/'
import hotUpdateConfig from './webpack.hot-update'
import BrowserSync from 'browser-sync'
import createApp from 'nva-server'

export default function(context, constants) {
    const { spa, sourceFolder, distFolder, mock, beforeDev, afterDev } = context

    return function(options) {
        let browserSync = BrowserSync.create()
        const port = options.port || 3000
        let config = hotUpdateConfig({ ...context, port }, constants, options.profile)
        if (typeof beforeDev === 'function') {
            config = mergeConfig(config, beforeDev(config))
        }
        const middlewares = middlewareFactory(config, () => {
            if (typeof afterDev === 'function') {
                afterDev()
            }
        }, options.profile)

        let rewrites = spa === true ? [{
            from: /\/(\S+)?$/,
            to: '/index.html'
        }] : false
        if (isString(spa) || Array.isArray(spa)) {
            rewrites = spa
        }

        const app = createApp({
            asset: spa ? distFolder : false,
            path: spa ? sourceFolder : false,
            log: false,
            rewrites,
            mock
        })

        process.once('SIGINT', () => {
            browserSync.exit()
            process.exit(0)
        })

        checkPort(port, available => {
            if (!available) {
                error('port is not avaiilable')
            } else {
                browserSync.init({
                    port,
                    server: spa ? false : [sourceFolder, distFolder],
                    middleware: middlewares.concat([app]),
                    files: [join(sourceFolder, '**', '*.html')],
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

                    let url = spa ? '/' : '/index'
                    url = `http://localhost:${port}${url}`
                    setTimeout(() => openBrowser(options.browser, url), 5000)
                })

            }
        })

    }
}