import os from 'os'
import path from 'path'
import fs from 'fs-extra'
import chalk from 'chalk'

export function getLanIP() {
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
    let stats = fs.statSync(path.resolve(target))
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
    console.log('😌  ' + info)
    console.log(stats.toString({
        version: false,
        chunks: false,
        colors: true
    }))
}