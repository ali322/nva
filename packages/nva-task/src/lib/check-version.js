import { readJsonSync } from 'fs-extra'
import { resolve } from 'path'
import axios from 'axios'
import chalk from 'chalk'
import { isEmpty, isEqual, differenceWith, map, forEach } from 'lodash'

export default async(target, done) => {
    let sourcemap = readJsonSync(resolve(target))
    let ret = await axios.all(Object.keys(sourcemap.version).map(v => axios.get(`https://registry.npmjs.org/${v}`)))
    let latest = {}
    ret.forEach(v => {
        if (v.status === 200) {
            v = v.data
            latest[v.name] = v['dist-tags'].latest
        }
    })
    if (isEmpty(latest)) {
        done()
    }
    if (isEqual(latest, sourcemap.version)) {
        done()
    } else {
        let outdated = differenceWith(
            map(latest, (v, k) => ({ name: k, version: v })),
            map(sourcemap.version, (v, k) => ({ name: k, version: v })),
            (r1, r2) => r1.version === r2.version)
        forEach(outdated, ({ version, name }) => {
            let local = sourcemap.version[name]
            console.log(chalk.yellow(`A newer version of ${name} is available.`))
            console.log('latest: ' + chalk.green(version),',installed: ' + chalk.gray(local))
        })
    }
}