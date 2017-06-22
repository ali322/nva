import jsf from 'json-schema-faker'
import { resolve } from 'path'

export default function(app, mock) {
    jsf.extend('faker', function() {
        let faker = require('faker/locale/en_US')
        return faker
    })
    try {
        let mocks = []
        if (typeof mock === 'string') {
            mock.split(',').forEach((v) => {
                let _v = require(resolve(v))
                mocks = mocks.concat(Array.isArray(_v) ? _v : [])
            })
        }
        if (Array.isArray(mock)) {
            mocks = mock
        }
        mocks.forEach(function(rule) {
            if ([].indexOf.call(['get', 'post', 'put', 'delete', 'head', 'patch'], rule.method) === -1) {
                throw new Error('method invalid!')
            }
            app.use(rule.url, function(req, res, next) {
                if (req.method.toLowerCase() === rule.method) {
                    res.statusCode = 200
                    res.setHeader("content-type", "application/json;charset=utf-8")
                    res.end(JSON.stringify(rule.response.type ? jsf(rule.response) : rule.response))
                }
            })
        })
    } catch (err) {
        console.log(err)
        throw new Error('mock config is invalid')
    }

    return app
}