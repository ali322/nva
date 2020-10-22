const webpack = require('webpack')
const del = require('del')
const { join } = require('path')
const { sourceMapByVendor, mergeConfig, checkVendor } = require('../common')
const { merge } = require('nva-util')

module.exports = context => {
  const {
    distFolder,
    assetFolder,
    output,
    beforeBuild,
    afterBuild,
    beforeVendor,
    afterVendor,
    hooks,
    vendors,
    vendorSourceMap
  } = context

  const tasks = {
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
          hooks.beforeBuild(
            releaseConfig.length === 1 ? releaseConfig[0] : releaseConfig
          )
        )
      }
      if (typeof beforeBuild === 'function') {
        releaseConfig = mergeConfig(
          releaseConfig,
          beforeBuild(
            releaseConfig.length === 1 ? releaseConfig[0] : releaseConfig
          )
        )
      }
      // cleanup dist
      del.sync([
        `${distFolder}/**`,
        `!${distFolder}`,
        `!${join(distFolder, assetFolder)}/**`,
        `!${output.vendorDevPath}/**`,
        `!${output.vendorPath}/**`
      ])

      const compiler = webpack(releaseConfig)
      compiler.run(function(err, stats) {
        if (typeof hooks.afterBuild === 'function') {
          hooks.afterBuild(err, stats)
        }
        if (typeof afterBuild === 'function') {
          afterBuild(err, stats)
        }
        if (err) {
          console.error(err)
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
        }
        // compiler.close()
        sourceMapByVendor(
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
      if (checkVendor(vendors, join(output.vendorDevPath, vendorSourceMap))) {
        developServer(context, options)
      } else {
        tasks.vendor(true, developServer.bind(null, context, options))
      }
    }
  }
  return tasks
}
