const os = require('os')
const path = require('path')
const fs = require('fs-extra')
const chalk = require('chalk')
const net = require('net')
const emoji = require('node-emoji')
const assign = require('lodash/assign')

exports.lanIP = () => {
  const interfaces = os.networkInterfaces()
  let IPv4 = '127.0.0.1'
  for (let key in interfaces) {
    interfaces[key].forEach(function (details) {
      if (details.family === 'IPv4' && /^en\d{1}$/.test(key) === true) {
        IPv4 = details.address
      }
    })
  }
  return IPv4
}

exports.current = () => {
  return new Date().toString().split(' ')[4]
}

exports.checkPort = (port, next) => {
  const server = net.createServer(function (socket) {
    socket.write('Echo server\r\n')
    socket.pipe(socket)
  })

  server.listen(port, () => {
    server.close()
    next(true)
  })
  server.on('error', () => {
    next(false)
  })
}

exports.bundleTime = () => {
  const dateObj = new Date()
  const year = dateObj.getFullYear()
  const month = dateObj.getMonth() + 1
  const date = dateObj.getDate()
  const hour = dateObj.getHours()
  const minute = dateObj.getMinutes()
  return '' + year + month + date + hour + minute
}

exports.relativeURL = (from, to) => {
  const url = path.relative(from, path.dirname(to)) || '.'
  return url + path.posix.sep + path.basename(to)
}

exports.checkFile = (target) => {
  let stats
  try {
    stats = fs.statSync(path.resolve(target))
  } catch (err) {
    return false
  }
  return stats.isFile()
}

exports.checkDir = (target) => {
  let stats
  try {
    stats = fs.statSync(path.resolve(target))
  } catch (e) {
    return false
  }
  return stats.isDirectory()
}

exports.error = (msg) => {
  console.log(chalk.red(msg))
  process.exit(1)
}

exports.merge = (target, ...args) => {
  return assign({}, target, ...args)
}

exports.emojis = (key) => {
  if (os.platform() === 'darwin') {
    return emoji.get(key)
  } else {
    return '>'
  }
}
