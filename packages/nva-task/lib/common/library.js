const del = require('del')
const webpack = require('webpack')
const { mergeConfig } = require('./index')
const configFactory = require('../webpack/config')

module.exports = {
  dev(context, profile, isWeb) {
    const { hooks, beforeDev, afterDev } = context
    let config = configFactory(context, profile, isWeb)
    if (typeof hooks.beforeDev === 'function') {
      config = mergeConfig(
        config,
        hooks.beforeDev(config.length === 1 ? config[0] : config)
      )
    }
    if (typeof beforeDev === 'function') {
      config = mergeConfig(
        config,
        beforeDev(config.length === 1 ? config[0] : config)
      )
    }
    const compiler = webpack(config)
    const watching = compiler.watch(
      Object.assign(
        {},
        {
          aggregateTimeout: 300
        },
        config.watchOptions
      ),
      function (err, stats) {
        if (typeof hooks.afterDev === 'function') {
          hooks.afterDev(err, stats)
        }
        if (typeof afterDev === 'function') {
          afterDev(err, stats)
        }
        if (err) {
          console.error(err)
        }
      }
    )
    return watching
  },
  build(context, profile, isWeb) {
    const { hooks, beforeBuild, afterBuild, distFolder } = context
    let config = configFactory(context, profile, isWeb)
    if (typeof hooks.beforeBuild === 'function') {
      config = mergeConfig(
        config,
        hooks.beforeBuild(config.length === 1 ? config[0] : config)
      )
    }
    if (typeof beforeBuild === 'function') {
      config = mergeConfig(
        config,
        beforeBuild(config.length === 1 ? config[0] : config)
      )
    }
    del.sync([`${distFolder}/**`])
    const compiler = webpack(config)
    compiler.run(function (err, stats) {
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
  }
}