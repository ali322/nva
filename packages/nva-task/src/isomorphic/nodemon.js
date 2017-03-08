import nodemon from 'nodemon'
import chalk from 'chalk'

function nodemonLog(message){
    let time = new Date().toString().split(' ')[4]
    console.log(chalk.yellow(`[${time}]${message}`))
}

export default function(options){
    let script = nodemon(options),
        started = false

    let exitHanlder = function(options){
        if(options.exit)script.emit('exit')
        if(options.quit)process.exit(0)
    }

    process.once('exit',exitHanlder.bind(null,{exit:true}))
    process.once('SIGINT',exitHanlder.bind(null,{quit:true}))

    script.on('log',function(log){
        // nodemonLog(log.colour)
    })

    script.on('start',function(){
        if (!started) {
            return
        }
        started = true
    })

    return script
}