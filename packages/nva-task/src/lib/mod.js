import { forEach, omit } from 'lodash'
import chalk from 'chalk'
import fs from 'fs-extra'
import { initModule } from './initializer'
import { writeToModuleConfig } from './'


export function addModule(names, answers, template, context) {
    const { moduleConf, moduleConfPath, modules } = context
    names = names.split(',')
    let _moduleConf = {}
    forEach(names, name => {
        if (Object.keys(moduleConf).indexOf(name) > -1) {
            console.log(chalk.red('name existed!'))
            return
        }
        _moduleConf[name] = answers
        let { input } = initModule(answers, name, context)

        let from = (template && modules[template]) ? modules[template].input : {}
        let to = input

        forEach(to, (v, k) => {
            if (fs.existsSync(from[k])) {
                fs.copySync(from[k], v)
            } else {
                fs.ensureFileSync(v)
            }
        })
    })
    _moduleConf = { ...moduleConf, ..._moduleConf }
    writeToModuleConfig(moduleConfPath, _moduleConf)
}

export function removeModule(names, context) {
    const { moduleConf, moduleConfPath, modules } = context
    names = names.split(',')
    let _moduleConf = omit(moduleConf, names)
    writeToModuleConfig(moduleConfPath, _moduleConf)

    forEach(names, name => {
        let to = modules[name].input
        if(!to){
            console.log(chalk.red(`module ${name} not existed,is it have been removed?`))
            return
        }
            console.log(to)
        forEach(to, (v, k) => {
            if (fs.existsSync(v)) {
                fs.removeSync(v)
            } else {
                console.log(chalk.red(`file ${v} not existed,is it have been removed?`))
                return
            }
        })
    })
}