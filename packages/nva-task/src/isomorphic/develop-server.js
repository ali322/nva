import browserSync from 'browser-sync'
import nodemon from './nodemon'
import { join } from 'path'
import createApp from 'nva-server'
import { mergeConfig, openBrowser } from '../lib'
import middlewareFactory from '../lib/middleware'
import hotUpdateConfigFactory from './webpack.hot-update'


export default function(context, constants) {
    const { runningMessage, serverFolder, viewFolder, beforeDev, mock, afterDev } = context
    const RUNNING_REGXP = new RegExp(runningMessage || 'server is running')
    return function(options) {
        nodemon({
            // delay: "200ms",
            script: "app.js",
            execMap: {
                "js": "node_modules/.bin/babel-node"
            },
            verbose: false,
            stdout: false,
            // ignore: ["*"],
            watch: [
                serverFolder, 'app.js'
            ],
            ext: "js html json es6 jsx"
        }).on("readable", function() {
            this.stdout.on('data', (chunk) => {
                if (RUNNING_REGXP.test(chunk.toString())) {
                    browserSync.reload({
                        stream: false
                    })
                }
            })
            this.stdout.pipe(process.stdout)
            this.stderr.pipe(process.stderr)
        })

        const port = options.port || 7000
        const proxyPort = context.port || 3000

        let app = createApp({
            log: false,
            cors: true,
            mock
        })
        let middleware = [app]
        let hotUpdateConfig = hotUpdateConfigFactory({ ...context, port }, constants, options.profile)
        if (typeof beforeDev === 'function') {
            hotUpdateConfig = mergeConfig(hotUpdateConfig, beforeDev(hotUpdateConfig))
        }
        middleware = middleware.concat(middlewareFactory(hotUpdateConfig, () => {
            if (typeof afterDev === 'function') {
                afterDev()
            }
        }, options.profile))

        let bs = browserSync({
            proxy: {
                target: "http://localhost:" + proxyPort,
                middleware
            },
            port,
            files: join(viewFolder, '*.html'),
            online: false,
            logLevel: "silent",
            notify: true,
            open: false,
            // reloadOnRestart:true,
            // browser: "google chrome",
            socket: {
                clientPath: "/bs",
            },
            scriptPath: function(path) {
                path = path.replace(/browser-sync-client(\.\d+)+/, "browser-sync-client")
                return "http://localhost:" + port + path
            }
        }, function() {
            // console.log('🚀  develop server is started at %d', proxyPort);

            let url = `http://localhost:${proxyPort}`
            setTimeout(() => openBrowser(options.browser, url), 5000)
        })

        bs.emitter.on("browser:reload", function() {
            // console.log("🌎  develop server reload");
        })
    }
}