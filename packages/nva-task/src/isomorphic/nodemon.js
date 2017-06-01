import nodemon from 'nodemon'
import chalk from 'chalk'
import { relative } from 'path'

export default function(options) {
    let script = nodemon(options),
        started = false

    let exitHanlder = function(options) {
        if (options.exit) script.emit('exit')
        if (options.quit) process.exit(0)
    }

    process.once('exit', exitHanlder.bind(null, { exit: true }))
    process.once('SIGINT', exitHanlder.bind(null, { quit: true }))

    script.on('restart', function(files) {
        console.log('🚀  ' + chalk.yellow('server restarting...'))
        files.forEach(function(file) {
            file = relative(process.cwd(), file)
            console.log(chalk.yellow(`file changed: ${file}`))
        })
    })

    script.on('start', function() {
        if (!started) {
            return
        }
        started = true
    })

    return script
}