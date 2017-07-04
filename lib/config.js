let yaml = require("js-yaml")
let fs = require("fs")
let path = require("path")
let assign = require('lodash/assign')

function loadYAML(name) {
    return yaml.safeLoad(fs.readFileSync(path.resolve(__dirname, "../etc/" + name + ".yml")))
}

exports.repoForTemplate = function(name) {
    let templates = loadYAML('template').templates
    return templates[name]
}

exports.availableTemplates = loadYAML('template').templates

exports.questions = function(name) {
    let questions = loadYAML(name).questions
    let _questions = []
    for (let k in questions) {
        let q = questions[k]
        _questions.push(assign({ name: k }, q))
    }
    return _questions
}