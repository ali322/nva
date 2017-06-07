import { forEach, zipObject, fill } from 'lodash'
import { resolve, join } from 'path'
import { error } from './helper'
import { existsSync, copySync, ensureFileSync, removeSync } from 'fs-extra'

export function addMod(names, answers, template, context) {
    const { mods, addMods } = context
    names = names.split(',')

    forEach(names, name => {
        if (Object.keys(mods).indexOf(name) > -1) {
            error('name existed!')
        }
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
    addMods(zipObject(names, fill(Array(3), answers)))
}

export function removeMod(names, context) {
    const { mods, removeMods, sourceFolder, bundleFolder } = context
    names = names.split(',')
    forEach(names, name => {
        let to = mods[name] && mods[name].input
        if (!to) {
            error(`module ${name} not existed,is it have been removed?`)
        }
        forEach(to, (v) => {
            if (existsSync(v)) {
                removeSync(v)
            } else {
                error(`file ${v} not existed,is it have been removed?`)
            }
        })
        const modFolder = join(sourceFolder, bundleFolder, name)
        if (existsSync(resolve(modFolder))) {
            removeSync(resolve(modFolder))
        }
    })
    removeMods(names)
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