import BrowserSync from 'browser-sync'
import nodemon from './nodemon'
import { join, dirname } from 'path'
import createApp from 'nva-server'
import { mergeConfig, openBrowser } from '../lib'
import middlewareFactory from '../lib/middleware'
import hotUpdateConfigFactory from './webpack.hot-update'

export default function (context) {
    const {
        runningMessage,
        serverFolder,
        viewFolder,
        distFolder,
        beforeDev,
        mock,
        afterDev,
        hooks,
        startWatcher
    } = context
    const RUNNING_REGXP = new RegExp(runningMessage || 'server is running')
    let cnt = 0
    return function (options) {
        startWatcher()

        let browserSync = BrowserSync.create()
        const port = options.port || 7000
        const proxyPort = context.port || 3000

        nodemon({
            // delay: "200ms",
            script: 'app.js',
            execMap: {
                js: join(
                    dirname(require.resolve('babel-cli')),
                    '..',
                    '.bin',
                    'babel-node'
                )
            },
            verbose: false,
            stdout: false,
            // ignore: ["*"],
            watch: [serverFolder, join(distFolder, serverFolder), 'app.js'],
            ext: 'js html json es6 jsx'
        }).on('readable', function () {
            this.stdout.on('data', chunk => {
                if (RUNNING_REGXP.test(chunk.toString())) {
                    ++cnt
                    if (cnt === 1) {
                        let url = `http://localhost:${proxyPort}`
                        setTimeout(
                            () => openBrowser(options.browser, url),
                            1000
                        )
                    }
                    browserSync.reload({
                        stream: false
                    })
                }
            })
            this.stdout.pipe(process.stdout)
            this.stderr.pipe(process.stderr)
        })

        let app = createApp({
            log: false,
            cors: true,
            mock: {
                path: mock,
                onChange (path) {
                    console.log(`file ${path} changed`)
                    browserSync.reload({ stream: false })
                },
                onAdd (path) {
                    console.log(`file ${path} added`)
                    browserSync.reload({ stream: false })
                },
                onRemove (path) {
                    console.log(`file ${path} removed`)
                    browserSync.reload({ stream: false })
                }
            }
        })
        let middleware = [app]
        let hotUpdateConfig = hotUpdateConfigFactory(
            { ...context, port },
            options.profile
        )
        if (typeof hooks.beforeDev === 'function') {
            hotUpdateConfig = mergeConfig(
                hotUpdateConfig,
                hooks.beforeDev(hotUpdateConfig)
            )
        }
        if (typeof beforeDev === 'function') {
            hotUpdateConfig = mergeConfig(
                hotUpdateConfig,
                beforeDev(hotUpdateConfig)
            )
        }
        middleware = middleware.concat(
            middlewareFactory(
                hotUpdateConfig,
                () => {
                    if (typeof hooks.afterDev === 'function') {
                        hooks.afterDev()
                    }
                    if (typeof afterDev === 'function') {
                        afterDev()
                    }
                },
                options.profile
            )
        )

        process.once('SIGINT', () => {
            browserSync.exit()
            process.exit(0)
        })

        browserSync.init(
            {
                proxy: {
                    target: 'http://localhost:' + proxyPort,
                    middleware
                },
                port,
                files: join(viewFolder, '*.html'),
                online: false,
                logLevel: 'silent',
                notify: true,
                open: false,
                // reloadOnRestart:true,
                // browser: "google chrome",
                socket: {
                    clientPath: '/bs'
                },
                scriptPath: function (path) {
                    path = path.replace(
                        /browser-sync-client(\.\d+)+/,
                        'browser-sync-client'
                    )
                    return 'http://localhost:' + port + path
                }
            },
            function () {
                // console.log('🚀  develop server is started at %d', proxyPort);
            }
        )
    }
}
