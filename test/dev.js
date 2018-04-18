import test from 'ava'
import { which, echo, exit, cd, rm, exec, cp, mkdir } from 'shelljs'
import { mkdtempSync, rmdirSync } from 'fs'
import { join, resolve } from 'path'

const BIN = resolve('bin')
const TEMPLATE = 'frontend-boilerplate'
let tmp

test.before(() => {
    tmp = resolve(mkdtempSync('nva-'))
    cd(tmp)
    exec(`git clone https://github.com/ali322/${TEMPLATE}`)
})

test.after(() => {
    // rm('-rf', tmp)
})

function devMacro(t, branch) {
    if (!which('git')) {
        echo('git required')
        exit(1)
    }
    cd(tmp)
    const proj = `${TEMPLATE}-${branch}`
    mkdir(proj)
    cp('-R', TEMPLATE, proj)
    cd(join(proj, TEMPLATE))
    exec('git checkout -- .')
    exec(`git checkout ${branch}`)
    rm('-rf', 'dist node_modules')
    exec('npm i')
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
            t.end()
        }
    })
}

test.cb(`${TEMPLATE}#master dev`, devMacro, 'master')
test.cb(`${TEMPLATE}#spa dev`, devMacro, 'spa')
test.cb(`${TEMPLATE}#vue-spa dev`, devMacro, 'vue-spa')
test.cb(`${TEMPLATE}#vue dev`, devMacro, 'vue')
