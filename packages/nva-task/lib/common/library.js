const del = require('del')
const webpack = require('webpack')
const { mergeConfig } = require('./index')
const configFactory = require('../webpack/config')

module.exports = (context, profile, isWeb) => {
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
