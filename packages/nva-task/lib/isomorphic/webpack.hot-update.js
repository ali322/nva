const webpack = require('webpack')
const { resolve, posix } = require('path')
const forEach = require('lodash/forEach')
const isPlainObject = require('lodash/isPlainObject')
const InjectHtmlPlugin = require('inject-html-webpack-plugin')
const ProgressPlugin = require('progress-webpack-plugin')
const TidyStatsPlugin = require('tidy-stats-webpack-plugin')
const { merge, serverHost } = require('nva-util')
const configFactory = require('../webpack/config')

module.exports = function(context, profile) {
  const {
    mods,
    sourceFolder,
    vendorDevFolder,
    vendorSourceMap,
    hmrPath,
    port,
    output,
    logText,
    pluginOptions
  } = context
  /** build variables */
  let confs = []
  const devServerHost = serverHost(port)
  const baseConfig = configFactory(merge(context, { isDev: true }), profile)
  const sourcemap = require(resolve(output.vendorDevPath, vendorSourceMap))
    .output

  const vendorAssets = (modVendor, type) => {
    if (isPlainObject(sourcemap[type])) {
      if (Array.isArray(modVendor[type])) {
        return modVendor[type]
          .filter(k => typeof sourcemap[type][k] === 'string')
          .map(k => posix.join(posix.sep, vendorDevFolder, sourcemap[type][k]))
      }
      return typeof sourcemap[type][modVendor[type]] === 'string'
        ? [
          posix.join(
            posix.sep,
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
          `?name=${name}&reload=true&path=${devServerHost}/__webpack_hmr_${name}`,
        mod.input.js
      ].concat(mod.input.css ? [mod.input.css] : [])
    }

    let dllRefs = (Array.isArray(mod.vendor.js)
      ? mod.vendor.js
      : [mod.vendor.js]
    ).map(key => {
      const manifestPath = resolve(output.vendorDevPath, `${key}-manifest.json`)
      const manifest = require(manifestPath)
      return new webpack.DllReferencePlugin({
        context: resolve(sourceFolder),
        manifest
      })
    })
    let injectHtmlOptions = isPlainObject(pluginOptions.injectHtml) ? pluginOptions.injectHtml : {}

    confs.push(
      merge(baseConfig, {
        entry,
        name,
        output: {
          path: output.path,
          filename: '[name].js',
          chunkFilename: '[id].chunk.js',
          publicPath: devServerHost + hmrPath
        },
        // context: __dirname,
        plugins: baseConfig.plugins
          .concat([
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
              transducer: devServerHost + hmrPath,
              chunks: [name],
              filename: mod.input.html,
              more: {
                js: vendorAssets(mod.vendor, 'js'),
                css: vendorAssets(mod.vendor, 'css')
              },
              custom: [
                {
                  start: '<!-- start:browser-sync -->',
                  end: '<!-- end:browser-sync -->',
                  content: `<script src="${devServerHost}/bs/browser-sync-client.js"></script>`
                }
              ]
            }, injectHtmlOptions))
          ])
          .concat(dllRefs)
      })
    )
  })

  return confs
}
