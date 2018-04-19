const jsf = require('json-schema-faker')
const { resolve, relative } = require('path')
const { parse } = require('url')
const glob = require('glob')
const chalk = require('chalk')
const connect = require('connect')
const chokidar = require('chokidar')
const { prettyError, isEq } = require('./lib')
const forEach = require('lodash/forEach')
const merge = require('lodash/merge')
const find = require('lodash/find')
const trim = require('lodash/trim')
const values = require('lodash/values')
const reduce = require('lodash/reduce')
const isFunction = require('lodash/isFunction')
const indexOf = require('lodash/indexOf')
const isRegExp = require('lodash/isRegExp')
const isString = require('lodash/isString')
const isPlainObject = require('lodash/isPlainObject')

module.exports = conf => {
  const app = connect()

  jsf.extend('faker', function() {
    return require('faker/locale/en_US')
  })
  let mocks = {}
  let watcher
  if (conf.path) {
    conf.path.split(',').forEach(v => {
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

    watcher = chokidar.watch(conf.path.split(','), { depth: 5 })
    watcher.on('change', path => {
      delete require.cache[resolve(path)]
      let rules = []
      try {
        rules = require(resolve(path))
      } catch (e) {
        console.log(prettyError(e))
      }
      if (Array.isArray(rules) === false) {
        console.log(chalk.red('mock config must return array'))
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
    watcher.on('add', path => {
      if (mocks[path] === undefined) {
        let rules = []
        try {
          rules = require(resolve(path))
        } catch (e) {
          console.log(prettyError(e))
        }
        if (Array.isArray(rules) === false) {
          console.log(chalk.red('mock config must return array'))
          return
        }
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
        isFunction(conf.onRemove) &&
          conf.onRemove(relative(process.cwd(), path))
      }
    })
  }
  app.use(function(req, res, next) {
    let rule = find(reduce(values(mocks), (sum, v) => sum.concat(v), []), v => {
      let reqPath = parse(req.url).pathname
      if (isRegExp(v.url)) {
        return v.url.test(reqPath)
      } else if (isString(v.url)) {
        return isEq(
          trim(v.url, '/').split('/'),
          trim(reqPath, '/').split('/'),
          ':',
          (target, match) => {
            req.params = req.params || {}
            req.params[target.replace(':', '')] = match
          }
        )
      }
      return false
    })
    if (rule && req.method.toLowerCase() === rule.method) {
      if (
        indexOf(
          ['get', 'post', 'put', 'delete', 'head', 'patch'],
          rule.method
        ) === -1
      ) {
        console.log(chalk.red('unsupported method'))
      }
      let headers = {
        'content-type': 'application/json;charset=utf-8'
      }
      headers = merge(
        {},
        headers,
        isPlainObject(rule.headers) ? rule.headers : {}
      )
      forEach(headers, (v, k) => {
        res.setHeader(k, v)
      })
      res.writeHead(rule.responseStatusCode || 200, {})
      let response = rule.response
      if (rule.type === 'jsf') {
        response = jsf(response)
      } else if (typeof response === 'function') {
        response = response(req)
      }
      if (rule.delay > 0) {
        setTimeout(() => {
          res.end(JSON.stringify(response))
        }, rule.delay)
      } else {
        res.end(JSON.stringify(response))
      }
    } else {
      next()
    }
  })

  return app
}
