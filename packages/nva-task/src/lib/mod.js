import { forEach, omit } from 'lodash'
import { resolve, join } from 'path'
import chalk from 'chalk'
import { existsSync, copySync, ensureFileSync, removeSync } from 'fs-extra'
import { writeModConf } from './'


export function addMod(names, answers, template, context) {
    const { conf, mods } = context
    names = names.split(',')
    let _mods = {}
    forEach(names, name => {
        if (Object.keys(conf.modConfPath).indexOf(name) > -1) {
            console.log(chalk.red('name existed!'))
            return
        }
        _mods[name] = answers
        let { input } = initMod(answers, name, context)

        let from = (template && mods[template]) ? mods[template].input : {}
        let to = input

        forEach(to, (v, k) => {
            if (existsSync(from[k])) {
                copySync(from[k], v)
            } else {
                ensureFileSync(v)
            }
        })
    })
    _mods = { ...conf.mods, ..._mods }
    writeModConf(conf.modConfPath, _mods)
}

export function removeMod(names, context) {
    const { conf, mods } = context
    names = names.split(',')
    let _mods = omit(conf.mods, names)
    writeModConf(conf.modConfPath, _mods)

    forEach(names, name => {
        let to = mods[name].input
        if (!to) {
            console.log(chalk.red(`module ${name} not existed,is it have been removed?`))
            return
        }
        forEach(to, (v) => {
            if (existsSync(v)) {
                removeSync(v)
            } else {
                console.log(chalk.red(`file ${v} not existed,is it have been removed?`))
                return
            }
        })
    })
}

export function initMod(mod, name, context) {
    const { sourceFolder, bundleFolder, jsExt, cssExt, htmlExt, type, viewFolder } = context

    // input
    let input = { ...mod.input } || {}
    input.js = input.js || join(sourceFolder, bundleFolder, name, name + jsExt)
    input.css = input.css || join(sourceFolder, bundleFolder, name, name + cssExt)
    input.js = resolve(input.js)
    input.css = resolve(input.css)
    input.html = input.html || (type === 'frontend' ?
        join(sourceFolder, bundleFolder, name, name + htmlExt) : join(viewFolder, name + htmlExt))
    input.html = resolve(input.html)

    //output
    let output = mod.output || {}

    return { input, output }
}