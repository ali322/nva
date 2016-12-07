var yaml = require("js-yaml")
var fs = require("fs")
var path = require("path")
var objectAssign = require("object-assign")

var _templateConfigFile = fs.readFileSync(path.resolve(__dirname,"../etc/template.yml"))
var _templates = yaml.safeLoad(_templateConfigFile).templates

var _questionConfigFile = fs.readFileSync(path.resolve(__dirname,"../etc/question.yml"))
var _questions = yaml.safeLoad(_questionConfigFile).questions

exports.repoForTemplate = function(templateName){
    return _templates[templateName]
}

exports.availableTemplates = _templates
exports.questions = function(){
    var _allQuestions = []
    for(var k in _questions){
        var _q = _questions[k]
        _allQuestions.push(objectAssign({name:k},_q))
    }
    return _allQuestions
}