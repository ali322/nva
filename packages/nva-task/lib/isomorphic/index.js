let { join } = require('path')
let forEach = require('lodash/forEach')
let isString = require('lodash/isString')
let webpack = require('webpack')
let chalk = require('chalk')
let del = require('del')
let { addMod, removeMod } = require('../common/mod')
let { vendorManifest, mergeConfig, checkVendor } = require('../common')
let { callback, merge } = require('../common/helper')
let vendorFactory = require('../common/vendor')
let serverConfigFactory = require('./webpack.server')
let clientConfigFactory = require('./webpack.client')
let bundleConfigFactory = require('./webpack.bundle')
let developServer = require('./develop-server')

module.exports = context => {
  let {
    output,
    serverFolder,
    serverEntry,
    distFolder,
    chunkFolder,
    sourceFolder,
    bundleFolder,
    beforeBuild,
    afterBuild,
    beforeServerBuild,
    afterServerBuild,
    beforeVendor,
    afterVendor,
    hooks,
    mods,
    vendors,
    vendorSourceMap
    } = context

  function createBundle(context, profile) {
    let bundleConfig = bundleConfigFactory(context, profile)
    del.sync(join(serverFolder, bundleFolder))
    if (Object.keys(bundleConfig.entry).length === 0) {
      return
    }
    let bundleCompiler = webpack(bundleConfig)

    function cb(err, stats) {
      if (err) throw err
      stats = stats.toJson()
      stats.errors.forEach(err => console.error(err))
      stats.warnings.forEach(err => console.warn(err))
      console.log(chalk.magenta('server side bundle is now VALID.'))
    }
    if (context.isDev) {
      bundleCompiler.watch({}, cb)
    } else {
      bundleCompiler.run(cb)
    }
  }

  const tasks = {
    addMod(names, answers, template) {
      addMod(names, answers, template, context)
    },
    removeMod(names) {
      removeMod(names, context)
    },
    build({ profile }) {
      if (
        checkVendor(
          vendors,
          join(output.vendorPath, vendorSourceMap)
        ) === false
      ) {
        tasks.vendor(false, tasks.build.bind(null, { profile }))
        return
      }

      let clientConfig = clientConfigFactory(context, profile)
      if (typeof hooks.beforeBuild === 'function') {
        clientConfig = mergeConfig(
          clientConfig,
          hooks.beforeBuild(clientConfig)
        )
      }
      if (typeof beforeBuild === 'function') {
        clientConfig = mergeConfig(
          clientConfig,
          beforeBuild(clientConfig)
        )
      }
      let serverConfig = serverEntry
        ? serverConfigFactory(context, profile)
        : null
      if (typeof hooks.beforeServerBuild === 'function') {
        serverConfig = mergeConfig(
          serverConfig,
          hooks.beforeServerBuild(serverConfig)
        )
      }
      if (typeof beforeServerBuild === 'function') {
        serverConfig = mergeConfig(
          serverConfig,
          beforeServerBuild(serverConfig)
        )
      }
      del.sync(join(distFolder, serverFolder))
      /** clean dist */
      forEach(mods, (mod, name) => {
        Object.keys(mod.output).forEach(v => {
          if (isString(mod.output[v])) {
            del.sync(mod.output[v])
          }
        })
        del.sync(join(distFolder, sourceFolder, name))
      })
      del.sync(join(distFolder, chunkFolder))

      createBundle(merge(context, { isDev: false }), profile)
      let compiler = webpack(
        serverEntry ? [clientConfig, serverConfig] : clientConfig
      )
      compiler.run(function (err, stats) {
        if (typeof hooks.afterServerBuild === 'function') {
          hooks.afterServerBuild(err, stats)
        }
        if (typeof afterServerBuild === 'function') {
          afterServerBuild(err, stats)
        }
        if (typeof hooks.afterBuild === 'function') {
          hooks.afterBuild(err, stats)
        }
        if (typeof afterBuild === 'function') {
          afterBuild(err, stats)
        }
        callback('Build success!', err, stats) // eslint-disable-line
      })
    },
    vendor(isDev, next) {
      let vendorConfig = vendorFactory(merge(context, { isDev }))
      if (typeof hooks.beforeVendor === 'function') {
        vendorConfig = mergeConfig(
          vendorConfig,
          hooks.beforeVendor(vendorConfig)
        )
      }
      if (typeof beforeVendor === 'function') {
        vendorConfig = mergeConfig(
          vendorConfig,
          beforeVendor(vendorConfig)
        )
      }
      del.sync(isDev ? output.vendorDevPath : output.vendorPath)
      let compiler = webpack(vendorConfig)
      compiler.run(function (err, stats) {
        vendorManifest(
          stats,
          vendors,
          join(
            isDev ? output.vendorDevPath : output.vendorPath,
            vendorSourceMap
          )
        )
        if (typeof hooks.afterVendor === 'function') {
          hooks.afterVendor(err, stats)
        }
        if (typeof afterVendor === 'function') {
          afterVendor(err, stats)
        }
        callback('Build vendor success!', err, stats) // eslint-disable-line
        if (next) next()
      })
    },
    dev(options) {
      createBundle(merge(context, { isDev: true }), options.profile)
      const runDev = developServer(context)
      if (
        checkVendor(
          vendors,
          join(output.vendorDevPath, vendorSourceMap)
        )
      ) {
        runDev(options)
      } else {
        tasks.vendor(true, runDev.bind(null, options))
      }
    }
  }

  return tasks
}
