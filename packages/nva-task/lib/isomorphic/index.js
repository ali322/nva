const { join } = require('path')
const forEach = require('lodash/forEach')
const isString = require('lodash/isString')
const webpack = require('webpack')
const del = require('del')
const { vendorManifest, mergeConfig, checkVendor } = require('../common')
const { merge } = require('nva-util')
const bus = require('./event-bus')

module.exports = context => {
  const {
    output,
    serverFolder,
    serverCompile,
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
    const bundleConfig = require('./webpack.bundle')(context, profile)
    del.sync(join(serverFolder, bundleFolder))
    if (Object.keys(bundleConfig.entry).length === 0) {
      return
    }
    const bundleCompiler = webpack(bundleConfig)

    function cb(err, stats) {
      if (err) throw err
      stats = stats.toJson()
      stats.errors.forEach(err => console.error(err))
      stats.warnings.forEach(err => console.warn(err))
      // console.log(chalk.magenta('server side bundle is now VALID.'))
      bus.emit('server-build-finished')
    }
    if (context.isDev) {
      bundleCompiler.watch({}, cb)
    } else {
      bundleCompiler.run(cb)
    }
  }

  const tasks = {
    build({ profile }) {
      if (
        checkVendor(vendors, join(output.vendorPath, vendorSourceMap)) === false
      ) {
        tasks.vendor(false, tasks.build.bind(null, { profile }))
        return
      }

      let clientConfig = require('./webpack.client')(context, profile)
      if (typeof hooks.beforeBuild === 'function') {
        clientConfig = mergeConfig(
          clientConfig,
          hooks.beforeBuild(clientConfig)
        )
      }
      if (typeof beforeBuild === 'function') {
        clientConfig = mergeConfig(clientConfig, beforeBuild(clientConfig))
      }
      let serverConfig = serverCompile
        ? require('./webpack.server')(context, profile)
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
      // cleanup dist
      del.sync(join(distFolder, serverFolder))
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
      const compiler = webpack(
        serverCompile ? [clientConfig, serverConfig] : clientConfig
      )
      compiler.run(function(err, stats) {
        if (err) {
          console.error(err)
          return
        }
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
      })
    },
    vendor(isDev, next) {
      let vendorConfig = require('../common/vendor')(merge(context, { isDev }))
      if (typeof hooks.beforeVendor === 'function') {
        vendorConfig = mergeConfig(
          vendorConfig,
          hooks.beforeVendor(vendorConfig)
        )
      }
      if (typeof beforeVendor === 'function') {
        vendorConfig = mergeConfig(vendorConfig, beforeVendor(vendorConfig))
      }

      // cleanup vendor dist
      del.sync(isDev ? output.vendorDevPath : output.vendorPath)

      const compiler = webpack(vendorConfig)
      compiler.run(function(err, stats) {
        if (err) {
          console.error(err)
          return
        }
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
        if (next) next()
      })
    },
    dev(options) {
      const developServer = require('./develop-server')
      createBundle(merge(context, { isDev: true }), options.profile)
      if (checkVendor(vendors, join(output.vendorDevPath, vendorSourceMap))) {
        developServer(context, options)
      } else {
        tasks.vendor(true, developServer.bind(null, context, options))
      }
    }
  }

  return tasks
}
