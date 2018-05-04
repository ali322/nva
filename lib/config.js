const yaml = require('js-yaml')
const fs = require('fs')
const path = require('path')
const assign = require('lodash/assign')
const map = require('lodash/map')

function loadYAML (name) {
  return yaml.safeLoad(
    fs.readFileSync(path.resolve(__dirname, '..', 'etc', name + '.yml'))
  )
}

exports.repoForType = function (name) {
  return loadYAML('template').templates[name]
}

exports.availableTemplates = loadYAML('template').templates

exports.questions = function (name) {
  return map(require(`../etc/${name}`), (q, k) => assign({}, { name: k }, q))
}
