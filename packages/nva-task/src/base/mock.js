import path from 'path'
import glob from 'glob'
import fs from 'fs-extra'
import jsf from 'json-schema-faker'
import express from 'express'

export default function(){
    jsf.extend('faker',function(){
        let faker = require('faker/locale/en_US')
        return faker
    })
    let app = express()
    let router = express.Router()
    let _apis = glob.sync('*.json',{cwd:path.resolve(process.cwd(), '.nva','api')})
    _apis.map(function(v) {
        return fs.readJsonSync(path.resolve(process.cwd(),'.nva','api', v))
    }).forEach(function(v){
        v.forEach(function(rule){
            if([].indexOf.call(['get','post','put','delete','head','patch'],rule.method) === -1){
                throw new Error('method invalid!')
            }
            app[rule.method](rule.url,function(req,res,next){
                res.status(200).json(rule.response.type?jsf(rule.response):rule.response)
            })
        })
    })
    router.all('*', function(req, res) {
        res.status(404).end()
    })
    app.use(function(err,req,res,next){
        res.status(500).send({err:err})
    })
    return app
}