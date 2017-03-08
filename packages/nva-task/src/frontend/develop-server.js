import fs from 'fs-extra'
import path from 'path'
import mock from '../base/mock'
import { mergeConfig } from '../lib'
import middlewareFactory from '../base/middleware'
import hotUpdateConfig from './webpack.hot-update'
import BrowserSync from 'browser-sync'

export default function(env, constants) {
    return function(options) {
        let browserSync = BrowserSync.create()
        const config = mergeConfig(hotUpdateConfig(env, constants))
        const _middleware = middlewareFactory(config)
        const { port } = options
        let _devPort = env.reloaderPort;
        _devPort = port || _devPort

        const app = mock()
        app.get('/', (req, res) => {
            const htmlPath = path.join('.', env.sourcePath, env.pageFolder, 'index.html')
            if (fs.existsSync(htmlPath)) {
                const html = fs.readFileSync(htmlPath, 'utf8')
                res.send(html)
            } else {
                res.send('page not found')
            }
        })
        for (let i in env.modules) {
            const mod = env.modules[i]
            app.get(`/${mod.name}\*`, (req, res) => {
                const htmlPath = path.join('.', env.sourcePath, env.pageFolder, `${mod.name}.html`)
                if (fs.existsSync(htmlPath)) {
                    const html = fs.readFileSync(htmlPath, 'utf8')
                    res.send(html)
                } else {
                    res.send('page not found')
                }
            })
        }

        process.once('SIGINT', () => {
            browserSync.exit()
            process.exit(0)
        })

        browserSync.init({
            port: _devPort,
            server: {
                baseDir: "."
            },
            middleware: _middleware.concat([
                app
            ]),
            files: [
                path.join(env.pagePath, '*.html')
            ],
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