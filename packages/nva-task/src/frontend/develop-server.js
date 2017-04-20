import path from 'path'
import { mergeConfig } from '../lib'
import middlewareFactory from '../base/middleware'
import hotUpdateConfig from './webpack.hot-update'
import BrowserSync from 'browser-sync'
import createApp from 'nva-server'

export default function(env, constants) {
    return function(options) {
        let browserSync = BrowserSync.create()
        const config = mergeConfig(hotUpdateConfig(env, constants))
        const _middleware = middlewareFactory(config)
        const { port } = options
        let _devPort = env.reloaderPort;
        _devPort = port || _devPort

        const app = createApp({
            asset: env.distFolder,
            path: env.spa ? path.join(env.sourcePath, env.bundleFolder) : false,
            log: false,
            rewrites: env.spa ? [{ from: /\/$/, to: '/index/index.html' }] : false,
            mockConf: path.join('.nva', 'api')
        })

        process.once('SIGINT', () => {
            browserSync.exit()
            process.exit(0)
        })

        browserSync.init({
            port: _devPort,
            server: env.spa ? false : [path.join(env.sourcePath, env.bundleFolder)],
            middleware: _middleware.concat([app]),
            files: [path.join(env.sourcePath, env.bundleFolder, '**', '*.html')],
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
            logLevel: "silent",
            socket: {
                clientPath: "/bs",
            },
            scriptPath: function(path) {
                path = path.replace(/browser-sync-client(\.\d+)+/, "browser-sync-client")
                return "http://localhost:" + _devPort + path
            }
        }, function() {
            console.log('🌎  develop server started at %d', _devPort);
        })
    }
}