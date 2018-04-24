const forEach = require('lodash/forEach')
const zipObject = require('lodash/zipObject')
const fill = require('lodash/fill')
const {resolve, join} = require('path')
const { error } = require('nva-util')
const { existsSync, copySync, ensureFileSync, removeSync } = require('fs-extra')

exports.addMod = (names, answers, template, context) => {
  const { mods, addMods } = context
  names = names.split(',')

  forEach(names, name => {
    if (Object.keys(mods).indexOf(name) > -1) {
      error('name existed!')
    }
    const { input } = exports.initMod(answers, name, context)
    let from = template && mods[template] ? mods[template].input : {}
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

exports.removeMod = (names, context) => {
  const { mods, removeMods, sourceFolder } = context
  names = names.split(',')
  forEach(names, name => {
    let to = mods[name] && mods[name].input
    if (!to) {
      error(`module ${name} not existed,is it have been removed?`)
    }
    forEach(to, v => {
      if (existsSync(v)) {
        removeSync(v)
      } else {
        error(`file ${v} not existed,is it have been removed?`)
      }
    })
    const modFolder = join(sourceFolder, name)
    if (existsSync(resolve(modFolder))) {
      removeSync(resolve(modFolder))
    }
  })
  removeMods(names)
}