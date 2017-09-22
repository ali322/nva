import jsf from 'json-schema-faker'
import { resolve, relative } from 'path'
import glob from 'glob'
import chokidar from 'chokidar'
import { find, groupBy, values, reduce, isFunction, indexOf } from 'lodash'

export default function(app, conf) {
    jsf.extend('faker', function() {
        let faker = require('faker/locale/en_US')
        return faker
    })
    try {
        let mocks = [],
            watcher
        if (conf.path) {
            watcher = chokidar.watch(conf.path.split(','), { depth: 5 })
            watcher.on('change', path => {
                delete require.cache[path]
                let rules = require(path)
                mocks[path] = rules.map(v => {
                    v.filename = path
                    return v
                })
                isFunction(conf.onChange) && conf.onChange(relative(process.cwd(), path))
            })
            watcher.on('add', path => {
                if (mocks[path] === undefined) {
                    let rules = require(path)
                    mocks[path] = rules.map(v => {
                        v.filename = path
                        return v
                    })
                    isFunction(conf.onAdd) && conf.onAdd(relative(process.cwd(), path))
                }
            })
            watcher.on('unlink', path => {
                if (mocks[path]) {
                    delete mocks[path]
                    isFunction(conf.onRemove) && conf.onRemove(relative(process.cwd(), path))
                }
            })
            conf.path.split(',').forEach((v) => {
                let files = glob.sync(v)
                files.forEach(file => {
                    let rules = require(resolve(file))
                    rules = rules.map(v => {
                        v.filename = resolve(file)
                        return v
                    })
                    mocks = mocks.concat(Array.isArray(rules) ? rules : [])
                })
            })
            mocks = groupBy(mocks, 'filename')
        }
        app.use(function(req, res, next) {
            let rule = find(reduce(values(mocks), (sum, v) => sum.concat(v), []), { url: req.url })
            if (rule && req.method.toLowerCase() === rule.method) {
                if (indexOf(['get', 'post', 'put', 'delete', 'head', 'patch'], rule.method) === -1) {
                    throw new Error('unsupported method')
                }
                res.statusCode = 200
                res.setHeader("content-type", "application/json;charset=utf-8")
                let response = rule.response
                if (rule.type === 'jsf') {
                    response = jsf(response)
                } else if (rule.type === 'func') {
                    response = response(req)
                }
                res.end(JSON.stringify(response))
            } else {
                next()
            }
        })
    } catch (err) {
        throw new Error('mock config invalid')
    }

    return app
}