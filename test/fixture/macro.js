const { which, echo, exit, cd, rm, exec, cp, mkdir } = require('shelljs')
const { resolve } = require('path')

const BIN = resolve('bin')
const TEMPLATE = 'frontend-boilerplate'
let tmp = resolve('tmp')

exports.devMacro = (t, branch) => {
    cd(tmp)
    cd(`${TEMPLATE}-${branch}`)
    let child = exec(`node ${BIN}/nva.js dev --silent --browser none`, {
        async: true,
        silent: true
    })
    child.stdout.on('data', data => {
        const msg = data.toString()
        const finished = new RegExp('server running at')
        const error = new RegExp('Error in')
        t.deepEqual(error.test(msg), false)
        if (finished.test(msg)) {
            child.kill()
        }
        t.end()
    })
}
