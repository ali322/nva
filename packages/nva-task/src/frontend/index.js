import webpack from 'webpack'
import del from 'del'
import { forEach, isString } from 'lodash'
import { join } from 'path'
import { addMod, removeMod } from '../lib/mod'
import { vendorManifest, mergeConfig, checkVendor } from '../lib'
import { callback } from '../lib/helper'
import vendorFactory from '../lib/vendor'
import releaseConfigFactory from './webpack.production'
import developServer from './develop-server'

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
    vendorSourceMap,
  } = context

  const tasks = {
    addMod (names, answers, template) {
      addMod(names, answers, template, context)
    },
    removeMod (names) {
      removeMod(names, context)
    },
    build ({ profile }) {
      if (
        checkVendor(vendors, join(output.vendorPath, vendorSourceMap)) ===
        false
      ) {
        tasks.vendor(tasks.build.bind(null, { profile }))
        return
      }
      let releaseConfig = releaseConfigFactory(context, profile)
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
      compiler.run(function (err, stats) {
        if (typeof hooks.afterBuild === 'function') {
          hooks.afterBuild(err, stats)
        }
        if (typeof afterBuild === 'function') {
          afterBuild(err, stats)
        }
        callback('Build success!', err, stats) // eslint-disable-line
      })
    },
    vendor (next) {
      let vendorConfig = vendorFactory(context)
      if (typeof hooks.beforeVendor === 'function') {
        vendorConfig = mergeConfig(
          vendorConfig,
          hooks.beforeVendor(vendorConfig)
        )
      }
      if (typeof beforeVendor === 'function') {
        vendorConfig = mergeConfig(vendorConfig, beforeVendor(vendorConfig))
      }
      del.sync(output.vendorPath)
      var compiler = webpack(vendorConfig)
      compiler.run(function (err, stats) {
        vendorManifest(
          stats,
          vendors,
          join(output.vendorPath, vendorSourceMap)
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
    dev (options) {
      const runDev = developServer(context)
      if (
        checkVendor(vendors, join(output.vendorPath, vendorSourceMap))
      ) {
        runDev(options)
      } else {
        tasks.vendor(runDev.bind(null, options))
      }
    }
  }
  return tasks
}
