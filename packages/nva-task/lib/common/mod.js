let forEach = require('lodash/forEach')
let zipObject = require('lodash/zipObject')
let fill = require('lodash/fill')
let isString = require('lodash/isString')
let {resolve, join} = require('path')
let { error, relativeURL, merge } = require('./helper')
let { existsSync, copySync, ensureFileSync, removeSync } = require('fs-extra')

exports.addMod = (names, answers, template, context) => {
  const { mods, addMods } = context
  names = names.split(',')

  forEach(names, name => {
    if (Object.keys(mods).indexOf(name) > -1) {
      error('name existed!')
    }
    let { input } = exports.initMod(answers, name, context)
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

exports.initMod = (mod, name, context) => {
  const {
    sourceFolder,
    jsExt,
    cssExt,
    htmlExt,
    viewFolder,
    distFolder
  } = context

  // input
  let input = merge(mod.input) || {}
  input.js = isString(input.js)
    ? input.js
    : join(sourceFolder, name, name + jsExt)
  input.css =
    isString(input.css) || input.css === false
      ? input.css
      : join(sourceFolder, name, name + cssExt)
  input.js = resolve(input.js)
  input.css = isString(input.css) ? resolve(input.css) : input.css
  input.html = isString(input.html)
    ? input.html
    : viewFolder
      ? join(viewFolder, name + htmlExt)
      : join(sourceFolder, name, name + htmlExt)
  input.html = resolve(input.html)

  // output
  let output = merge(mod.output) || {}
  output.js = isString(output.js) ? relativeURL(distFolder, output.js) : false
  output.css = isString(output.css)
    ? relativeURL(distFolder, output.css)
    : false
  output.html = isString(output.html)
    ? output.html
    : join(distFolder, name, `${name}.html`)

  return { input, output }
}