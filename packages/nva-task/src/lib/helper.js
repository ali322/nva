import os from 'os'
import path from 'path'
import fs from 'fs-extra'
import chalk from 'chalk'
import net from 'net'
import emoji from 'node-emoji'

export function lanIP() {
    let interfaces = os.networkInterfaces();
    let IPv4 = '127.0.0.1';
    for (let key in interfaces) {
        interfaces[key].forEach(function(details) {
            if (details.family == 'IPv4' && /^en\d{1}$/.test(key) === true) {
                IPv4 = details.address;
            }
        });
    }
    return IPv4;
}

export function current(){
    return new Date().toString().split(' ')[4]
}

export function checkPort(port, callback) {
    let server = net.createServer(function(socket) {
        socket.write('Echo server\r\n')
        socket.pipe(socket)
    })

    server.listen(port, () => {
        server.close()
        callback(true)
    })
    server.on('error', () => {
        callback(false)
    })
}

export function bundleTime() {
    const dateObj = new Date()
    const year = dateObj.getFullYear()
    const month = dateObj.getMonth() + 1
    const date = dateObj.getDate()
    const hour = dateObj.getHours()
    const minute = dateObj.getMinutes()
    return "" + year + month + date + hour + minute
}

export function relativeURL(from, to) {
    const _url = path.relative(from, path.dirname(to)) || '.'
    return _url + path.sep + path.basename(to)
}

export function checkFile(target) {
    let stats
    try {
        stats = fs.statSync(path.resolve(target))
    } catch (err) {
        return false
    }
    return stats.isFile()
}

export function checkDir(target) {
    let stats = fs.statSync(path.resolve(target))
    return stats.isDirectory()
}

export function error(msg) {
    console.log(chalk.red(msg))
    process.exit(1)
}

export function callback(info, err, stats) {
    if (err || stats.hasErrors()) {
        console.log(chalk.red(err, stats))
        return
    }
    console.log(stats.toString({
        version: false,
        chunks: false,
        colors: true
    }))
    console.log(`${emojis('simle')}  ` + info)
}

export function emojis(key){
    if(os.platform() === 'darwin') {
        return emoji.get(key)
    } else {
        return '>'
    }
}