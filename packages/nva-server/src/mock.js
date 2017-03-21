import path from 'path'
import glob from 'glob'
import fs from 'fs-extra'
import jsf from 'json-schema-faker'

export default function(app,mockPath) {
    jsf.extend('faker', function() {
        let faker = require('faker/locale/en_US')
        return faker
    })
    let _apis = glob.sync('*.json', { cwd: path.resolve(mockPath) })
    _apis.map(function(v) {
        return fs.readJsonSync(path.resolve(mockPath, v))
    }).forEach(function(v) {
        v.forEach(function(rule) {
            if ([].indexOf.call(['get', 'post', 'put', 'delete', 'head', 'patch'], rule.method) === -1) {
                throw new Error('method invalid!')
            }
            app.use(rule.url, function(req, res, next) {
                if(req.method === rule.method){
                    res.statusCode = 200
                    res.setHeader("content-type", "application/json")
                    res.end(JSON.stringify(rule.response.type ? jsf(rule.response) : rule.response))
                }
            })
        })
    })
    
    return app
}