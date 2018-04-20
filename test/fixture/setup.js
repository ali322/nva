const { resolve, join } = require('path')
const { cd, exec, which, echo, exit, mkdir, cp, rm, mv } = require('shelljs')
const { copySync } = require('fs-extra')
const { forEach } = require('lodash')

const projects = {
    'frontend-boilerplate': ['master', 'spa', 'vue-spa', 'vue'],
    'ssr-boilerplate': ['master', 'spa', 'vue-spa', 'vue']
}
const BIN = resolve('bin')

mkdir('tmp')
let tmp = resolve('tmp')
cd(tmp)
Object.keys(projects).forEach(v => {
  exec(`git clone https://github.com/ali322/${v}`)
})

if (!which('git')) {
    echo('git required')
    exit(1)
}

forEach(projects, (v, k) => {
    forEach(v, branch => {
        cd(tmp)
        const proj = `${k}-${branch}`
        copySync(k, proj)
        cd(proj)
        exec(`git checkout ${branch}`)
        exec('npm i')
    })
})
