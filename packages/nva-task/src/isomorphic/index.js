import { join } from 'path'
import { forEach, isString } from 'lodash'
import webpack from 'webpack'
import chalk from 'chalk'
import del from 'del'
import { addMod, removeMod } from '../lib/mod'
import { vendorManifest, mergeConfig, checkVendor } from '../lib'
import { callback } from '../lib/helper'
import vendorFactory from '../lib/vendor'
import serverConfigFactory from './webpack.server'
import clientConfigFactory from './webpack.client'
import bundleConfigFactory from './webpack.bundle'
import developServer from './develop-server'

module.exports = context => {
  let {
    output,
    serverFolder,
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

  function createBundle (context, profile) {
    let bundleConfig = bundleConfigFactory(context, profile)
    del.sync(join(serverFolder, bundleFolder))
    if (Object.keys(bundleConfig.entry).length === 0) {
      return
    }
    let bundleCompiler = webpack(bundleConfig)

    function cb (err, stats) {
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

      let serverConfig = serverConfigFactory(context, profile)
      let clientConfig = clientConfigFactory(context, profile)
      if (typeof hooks.beforeBuild === 'function') {
        clientConfig = mergeConfig(
          clientConfig,
          hooks.beforeBuild(clientConfig)
        )
        serverConfig = mergeConfig(
            serverConfig,
            hooks.beforeServerBuild(serverConfig)
        )
      }
      if (typeof beforeBuild === 'function') {
        clientConfig = mergeConfig(clientConfig, beforeBuild(clientConfig))
        serverConfig = mergeConfig(serverConfig, beforeServerBuild(serverConfig))
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

      createBundle({ ...context, isDev: false }, profile)
      let compiler = webpack([clientConfig, serverConfig])
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
      let compiler = webpack(vendorConfig)
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
      createBundle({ ...context, isDev: true }, options.profile)
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
