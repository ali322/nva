const isString = require('lodash/isString')
const forEach = require('lodash/forEach')
const omit = require('lodash/omit')
const {
  existsSync,
  copySync,
  ensureFileSync,
  removeSync,
  outputJsonSync,
  readJsonSync
} = require('fs-extra')
const { relativeURL, merge, error } = require('nva-util')
const { join, resolve } = require('path')

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

exports.addMod = (names, answers, template, context) => {
  const { modConfPath, sourceFolder } = context
  const mods = readJsonSync(modConfPath)
  names = names.split(',')

  let inputs = {}
  forEach(names, name => {
    if (Object.keys(mods).indexOf(name) > -1) {
      error(`module ${name} existed!`)
    }
    const input = {
      html: answers.input.html || join(sourceFolder, name, `${name}.html`),
      js: answers.input.js || join(sourceFolder, name, `${name}.js`),
      css: answers.input.css || join(sourceFolder, name, `${name}.css`)
    }
    inputs[name] = { input }
    let from = template && mods[template] ? mods[template].input : {}
    let to = input
    forEach(to, (v, k) => {
      if (existsSync(from[k])) {
        copySync(from[k], resolve(v))
      } else {
        ensureFileSync(resolve(v))
      }
    })
  })
  outputJsonSync(modConfPath, merge(mods, inputs), { spaces: 2 })
}

exports.removeMod = (names, context) => {
  const { modConfPath, sourceFolder } = context
  const mods = readJsonSync(modConfPath)
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
  outputJsonSync(modConfPath, omit(mods, names), { spaces: 2 })
}
