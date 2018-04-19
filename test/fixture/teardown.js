const { rm } = require('shelljs')
const { resolve } = require('path')

let tmp = resolve('tmp')
rm('-rf', tmp)