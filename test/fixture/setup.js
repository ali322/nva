const { resolve, join } = require('path')
const { cd, exec, which, echo, exit, mkdir, cp, rm, mv } = require('shelljs')
const { copySync } = require('fs-extra')

const branches = ['master', 'spa', 'vue-spa', 'vue']
const BIN = resolve('bin')
const TEMPLATE = 'frontend-boilerplate'

mkdir('tmp')
let tmp = resolve('tmp')
cd(tmp)
exec(`git clone https://github.com/ali322/${TEMPLATE}`)

if (!which('git')) {
    echo('git required')
    exit(1)
}

branches.forEach(branch => {
    cd(tmp)
    const proj = `${TEMPLATE}-${branch}`
    copySync(TEMPLATE, proj)
    cd(proj)
    exec(`git checkout ${branch}`)
    exec('npm i')
})
