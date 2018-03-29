let webpack = require('webpack')
let del = require('del')
let forEach = require('lodash/forEach')
let isString = require('lodash/isString')
let { join } = require('path')
let { addMod, removeMod } = require('../common/mod')
let { vendorManifest, mergeConfig, checkVendor } = require('../common')
let { merge } = require('../common/helper')

module.exports = context => {
  let {
    distFolder,
    chunkFolder,
    output,
    beforeBuild,
    afterBuild,
    beforeVendor,
    afterVendor,
    hooks,
    mods,
    vendors,
    vendorSourceMap
  } = context

  const tasks = {
    addMod(names, answers, template) {
      addMod(names, answers, template, context)
    },
    removeMod(names) {
      removeMod(names, context)
    },
    build({ profile }) {
      if (
        checkVendor(vendors, join(output.vendorPath, vendorSourceMap)) === false
      ) {
        tasks.vendor(false, tasks.build.bind(null, { profile }))
        return
      }
      let releaseConfig = require('./webpack.production')(context, profile)
      if (typeof hooks.beforeBuild === 'function') {
        releaseConfig = mergeConfig(
          releaseConfig,
          hooks.beforeBuild(releaseConfig)
        )
      }
      if (typeof beforeBuild === 'function') {
        releaseConfig = mergeConfig(releaseConfig, beforeBuild(releaseConfig))
      }
      /** clean build assets */
      forEach(mods, (mod, name) => {
        Object.keys(mod.output).forEach(v => {
          if (isString(mod.output[v])) {
            del.sync(mod.output[v])
          }
        })
        del.sync(join(distFolder, name))
      })
      del.sync(join(distFolder, chunkFolder))

      let compiler = webpack(releaseConfig)
      compiler.run(function(err, stats) {
        if (err) {
          console.error(err)
          return
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
      del.sync(isDev ? output.vendorDevPath : output.vendorPath)
      var compiler = webpack(vendorConfig)
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
      let developServer = require('./develop-server')
      if (checkVendor(vendors, join(output.vendorDevPath, vendorSourceMap))) {
        developServer(context, options)
      } else {
        tasks.vendor(true, developServer.bind(null, context, options))
      }
    }
  }
  return tasks
}
