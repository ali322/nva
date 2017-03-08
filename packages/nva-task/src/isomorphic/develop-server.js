import browserSync from 'browser-sync'
import nodemon from './nodemon'
import mock from '../base/mock'
import { env,mergeConfig } from '../lib'
import middlewareFactory from '../base/middleware'
import hotUpdateConfig from './webpack.hot-update'

const RUNNING_REGXP = new RegExp(env.nvaConfig.runningMessage || 'server is running')
const integrated = env.nvaConfig.integrated || false

export default function(env,constants) {
    return function(options){
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
                "server"
            ],
            ext: "js html json es6 jsx"
        }).on("readable", function() {
            this.stdout.on('data', function(chunk) {
                if (RUNNING_REGXP.test(chunk)) {
                    browserSync.reload({
                        stream: false
                    })
                }
                process.stdout.write(chunk);
            });
            // this.stdout.pipe(process.stdout);
            this.stderr.pipe(process.stderr);
        })

        const { port } = options
        let _devPort = env.reloaderPort;
        _devPort = port || _devPort
        let listenPort = process.env.LISTEN_PORT || 3000
        let middleware = [mock()]
        if (integrated) {
            middleware = middleware.concat(middlewareFactory(mergeConfig(hotUpdateConfig(env,constants))))
        }

        browserSync({
            proxy: {
                target: "http://localhost:" + listenPort,
                middleware
            },
            port: _devPort,
            files: "view/*.html",
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
                return "http://localhost:" + _devPort + path
            }
        }, function() {
            console.log('🚀  browser-sync is started at %d', _devPort);
        })
    }
}