const { which, echo, exit, cd, rm, exec, cp, mkdir } = require('shelljs')
const { resolve } = require('path')

const BIN = resolve('bin')
let tmp = resolve('tmp')

exports.devMacro = (t, type, branch) => {
    cd(tmp)
    cd(`${type}-${branch}`)
    let child = exec(`node ${BIN}/nva.js dev --silent --browser none`, {
        async: true,
        silent: true
    })
    child.stdout.on('data', data => {
        const msg = data.toString()
        const finished = new RegExp('running at')
        const error = new RegExp('Error in')
        t.deepEqual(error.test(msg), false)
        if (finished.test(msg)) {
            child.kill()
        }
        t.end()
    })
}

exports.buildMacro = (t, type, branch) => {
    cd(tmp)
    cd(`${type}-${branch}`)
    let child = exec(`node ${BIN}/nva.js build --silent`, {
        async: true,
        silent: true
    })
    child.stdout.on('data', data => {
        const msg = data.toString()
        const finished = new RegExp('Build finished')
        const error = new RegExp('Error in')
        t.deepEqual(error.test(msg), false)
        if (finished.test(msg)) {
            child.kill()
        }
        t.end()
    })
}
