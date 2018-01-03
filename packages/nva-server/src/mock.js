import jsf from "json-schema-faker"
import { resolve, relative } from "path"
import { parse } from "url"
import glob from "glob"
import chalk from "chalk"
import chokidar from "chokidar"
import { prettyError, isEq } from "./lib"

import {
    find,
    trim,
    values,
    reduce,
    isFunction,
    indexOf,
    isRegExp,
    isString
} from "lodash"

export default function (app, conf) {
    jsf.extend("faker", function () {
        let faker = require("faker/locale/en_US")
        return faker
    })
    let mocks = {},
        watcher
    if (conf.path) {
        conf.path.split(",").forEach(v => {
            let files = glob.sync(v)
            files.forEach(file => {
                let rules = []
                try {
                    rules = require(resolve(file))
                } catch (e) {
                    console.log(prettyError(e))
                    mocks[resolve(file)] = []
                    return false
                }
                mocks[resolve(file)] = Array.isArray(rules) ? rules : []
            })
        })

        watcher = chokidar.watch(conf.path.split(","), { depth: 5 })
        watcher.on("change", path => {
            delete require.cache[resolve(path)]
            let rules = []
            try {
                rules = require(resolve(path))
            } catch (e) {
                console.log(prettyError(e))
            }
            if (Array.isArray(rules) === false) {
                console.log(chalk.red("mock config must return array"))
                return
            }
            mocks[path] = rules.map(v => {
                v.filename = path
                return v
            })
            if (isFunction(conf.onChange)) {
                conf.onChange(relative(process.cwd(), path))
            }
        })
        watcher.on("add", path => {
            if (mocks[path] === undefined) {
                let rules = []
                try {
                    rules = require(resolve(path))
                } catch (e) {
                    console.log(prettyError(e))
                }
                if (Array.isArray(rules) === false) {
                    console.log(chalk.red("mock config must return array"))
                    return
                }
                mocks[path] = rules.map(v => {
                    v.filename = path
                    return v
                })
                isFunction(conf.onAdd) &&
                    conf.onAdd(relative(process.cwd(), path))
            }
        })
        watcher.on("unlink", path => {
            if (mocks[path]) {
                delete mocks[path]
                isFunction(conf.onRemove) &&
                    conf.onRemove(relative(process.cwd(), path))
            }
        })
    }
    app.use(function (req, res, next) {
        let rule = find(
            reduce(values(mocks), (sum, v) => sum.concat(v), []),
            v => {
                let reqPath = parse(req.url).pathname
                if (isRegExp(v.url)) {
                    return v.url.test(reqPath)
                } else if (isString(v.url)) {
                    return isEq(
                        trim(v.url, "/").split("/"),
                        trim(reqPath, "/").split("/"),
                        ":",
                        (target, match) => {
                            req.params = req.params || {}
                            req.params[target.replace(":", "")] = match
                        }
                    )
                }
                return false
            }
        )
        if (rule && req.method.toLowerCase() === rule.method) {
            if (
                indexOf(
                    ["get", "post", "put", "delete", "head", "patch"],
                    rule.method
                ) === -1
            ) {
                console.log(chalk.red("unsupported method"))
            }
            res.statusCode = 200
            res.setHeader("content-type", "application/json;charset=utf-8")
            let response = rule.response
            if (rule.type === "jsf") {
                response = jsf(response)
            } else if (typeof response === 'function') {
                response = response(req)
            }
            res.end(JSON.stringify(response))
        } else {
            next()
        }
    })

    return app
}
