const { DllReferencePlugin } = require('webpack')
const { join, resolve, posix } = require('path')
const forEach = require('lodash/forEach')
const isPlainObject = require('lodash/isPlainObject')
const InjectHtmlPlugin = require('inject-html-webpack-plugin')
const TidyStatsPlugin = require('tidy-stats-webpack-plugin')
const ProgressPlugin = require('progress-webpack-plugin')
const { merge } = require('nva-util')
const configFactory = require('../webpack/config')

module.exports = function(context, profile, options) {
  const {
    mods,
    distFolder,
    chunkFolder,
    vendorDevFolder,
    vendorSourceMap,
    hmrPath,
    output,
    afterInject,
    logText,
    pluginOptions
  } = context

  /** build variables */
  const { protocol, hostname, port } = options
  const devServerHost = `${protocol}://${hostname}:${port}`
  let confs = []
  const baseConfig = configFactory(merge(context, { isDev: true }), profile)
  const sourcemap = require(resolve(output.vendorDevPath, vendorSourceMap))
    .output

  const vendorAssets = (modVendor, type) => {
    if (isPlainObject(sourcemap[type])) {
      if (Array.isArray(modVendor[type])) {
        return modVendor[type]
          .filter(k => typeof sourcemap[type][k] === 'string')
          .map(k =>
            posix.join(
              posix.sep,
              distFolder,
              vendorDevFolder,
              sourcemap[type][k]
            )
          )
      }
      return typeof sourcemap[type][modVendor[type]] === 'string'
        ? [
          posix.join(
            posix.sep,
            distFolder,
            vendorDevFolder,
            sourcemap[type][modVendor[type]]
          )
        ]
        : []
    }
    return []
  }

  /** build modules */
  forEach(mods, (mod, name) => {
    let entry = {
      [name]: [
        require.resolve('webpack-hot-middleware/client') +
                `?name=${name}&path=${devServerHost}/__webpack_hmr_${name}&reload=true`
      ]
        .concat(mod.input.css ? [mod.input.css] : [])
        .concat([mod.input.js])
    }

    let dllRefs = (Array.isArray(mod.vendor.js)
      ? mod.vendor.js
      : [mod.vendor.js]
    ).map(key => {
      let manifestPath = resolve(output.vendorDevPath, `${key}-manifest.json`)
      let manifest = require(manifestPath)
      return new DllReferencePlugin({
        context: resolve(),
        manifest
      })
    })
    let injectHtmlOptions = isPlainObject(pluginOptions.injectHtml) ? pluginOptions.injectHtml : {}

    confs.push(
      merge(baseConfig, {
        name,
        entry,
        profile,
        output: {
          path: output.path,
          filename: join('[name]', '[name].js'),
          chunkFilename: join(chunkFolder, '[id].chunk.js'),
          publicPath: hmrPath
        },
        // bail: true,
        // context: __dirname,
        plugins: baseConfig.plugins.concat(dllRefs, [
          new ProgressPlugin({
            identifier: name,
            onProgress: context.onDevProgress
          }),
          new TidyStatsPlugin({
            identifier: name,
            ignoreAssets: true,
            logText: {
              success: logText.buildSuccess,
              warn: logText.buildWarn,
              error: logText.buildError
            }
          }),
          new InjectHtmlPlugin(merge({
            transducer: hmrPath,
            chunks: [name],
            filename: mod.input.html,
            output: afterInject,
            more: {
              js: vendorAssets(mod.vendor, 'js'),
              css: vendorAssets(mod.vendor, 'css')
            }
          }, injectHtmlOptions))
        ])
      })
    )
  })

  return confs
}
