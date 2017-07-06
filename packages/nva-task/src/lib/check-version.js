import { readJsonSync } from 'fs-extra'
import { resolve } from 'path'
import axios from 'axios'
import chalk from 'chalk'
import inquirer from 'inquirer'
import { isEmpty, isEqual, differenceWith, map, forEach } from 'lodash'
import { shellSync as execSync } from 'execa'

export default (target, done) => {
    let sourcemap = readJsonSync(resolve(target))
    axios.all(Object.keys(sourcemap.version).map(v => axios.get(`https://registry.npmjs.org/${v}`)))
        .then(ret => {
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
                    console.log('outdated',outdated)
                forEach(outdated, ({ version, name }) => {
                    let local = sourcemap.version[name]
                    console.log(chalk.yellow(`A newer version of ${name} is available.`))
                    console.log('latest:    ' + chalk.green(version))
                    console.log('installed: ' + chalk.gray(local))
                    inquirer.prompt([{
                        type: "confirm",
                        name: 'yes',
                        message: `upgrade ${name} to latest version?`
                    }]).then(function(answer) {
                        if (answer.yes) {
                            try {
                                execSync(`npm i ${name}@${version} -S`, { stdio: 'inherit' })
                                // done()
                            } catch (err) {
                                console.error(err)
                                process.exit(1)
                            }
                        } else {
                            // done()
                        }
                    })
                })
            }
        }).catch(function() {
            done()
        })
}