let axios = require('axios')
let semver = require('semver')
let chalk = require('chalk')
let inquirer = require("inquirer")
let execSync = require('execa').shellSync

module.exports = function(done, pkgs) {
    let locals = {}
    pkgs.forEach(v => {
        let version
        try {
            version = require(resolve('node_modules', v, 'package.json')).version
            locals[v] = version
        } catch (e) {
            locals[v] = null
        }
    })
    axios.all(pkgs.map(v => axios.get(`https://registry.npmjs.org/${v}`))).then(rets => {
        let latest = {}
        rets.forEach(v => {
            if (v.status === 200) {
                v = v.data
                latest[v.name] = v['dist-tags'].latest
            }
        })

        if (isEmpty(latest)) {
            done()
        }
        if (isEqual(latest, locals)) {
            done()
        } else {
            let outdated = differenceWith(
                map(latest, (v, k) => ({ name: k, version: v })),
                map(locals, (v, k) => ({ name: k, version: v })),
                (r1, r2) => r1.version === r2.version)
            let questions = outdated.map(v => ({
                type: "confirm",
                name: v,
                message: `newer version of ${v} is available, upgrade now?`
            }))
            inquirer.prompt(questions).then(answer => {
                let upgrades = []
                console.log('answer', answer)
            })
        }
    }).catch(() => {
        done()
    })
}