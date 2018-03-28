let webpack = require('webpack')
let { resolve, posix } = require('path')
let forEach = require('lodash/forEach')
let isPlainObject = require('lodash/isPlainObject')
let InjectHtmlPlugin = require('inject-html-webpack-plugin')
let ProgressPlugin = require('progress-webpack-plugin')
let TidyStatsPlugin = require('tidy-stats-webpack-plugin')
let { serverHost } = require('../common')
let { merge } = require('../common/helper')
let { config: configFactory } = require('nva-core')

module.exports = function (context, profile) {
  const {
        vendors,
    mods,
    sourceFolder,
    vendorDevFolder,
    vendorSourceMap,
    hmrPath,
    port,
    output
    } = context
  /** build variables */
  let entry = {}
  let htmls = []
  let devServerHost = serverHost(port)
  let baseConfig = configFactory(merge(context, { isDev: true }), profile)

  /** add vendors reference */
  let dllRefs = []
  let sourcemapPath = resolve(output.vendorDevPath, vendorSourceMap)
  let sourcemap = require(sourcemapPath).output
  if (isPlainObject(vendors.js)) {
    for (let key in vendors['js']) {
      let manifestPath = resolve(
        output.vendorDevPath,
        key + '-manifest.json'
      )
      let manifest = require(manifestPath)
      dllRefs.push(
        new webpack.DllReferencePlugin({
          context: resolve(sourceFolder),
          manifest
        })
      )
    }
  }

  /** build modules */
  forEach(mods, (mod, name) => {
    entry[name] = [
      require.resolve('webpack-hot-middleware/client') +
      '?path=' +
      devServerHost +
      '/__webpack_hmr',
      mod.input.js
    ].concat(mod.input.css ? [mod.input.css] : [])
    let chunks = [name]

    let more = { js: [], css: [] }
    if (mod.vendor) {
      if (mod.vendor.js && sourcemap.js && sourcemap.js[mod.vendor.js]) {
        more.js = [
          posix.join(
            posix.sep,
            vendorDevFolder,
            sourcemap.js[mod.vendor.js]
          )
        ]
      }
      if (
        mod.vendor.css &&
        sourcemap.css &&
        sourcemap.css[mod.vendor.css]
      ) {
        more.css = [
          posix.join(
            posix.sep,
            vendorDevFolder,
            sourcemap.css[mod.vendor.css]
          )
        ]
      }
    }
    htmls.push(
      new InjectHtmlPlugin({
        transducer: devServerHost + hmrPath,
        chunks,
        filename: mod.input.html,
        more,
        customInject: [
          {
            start: '<!-- start:browser-sync -->',
            end: '<!-- end:browser-sync -->',
            content:
              `<script src="${devServerHost}/bs/browser-sync-client.js"></script>`
          }
        ]
      })
    )
  })

  return merge(baseConfig, {
    entry,
    output: {
      path: output.path,
      filename: '[name].js',
      chunkFilename: '[id].chunk.js',
      publicPath: devServerHost + hmrPath
    },
    // context: __dirname,
    resolveLoader: {
      modules: [resolve('node_modules'), 'node_modules']
    },
    resolve: {
      modules: [sourceFolder, resolve('node_modules'), 'node_modules']
    },
    plugins: baseConfig.plugins.concat([
      new ProgressPlugin(true, { onProgress: context.onDevProgress }),
      new TidyStatsPlugin({ignoreAssets: true})
    ]).concat(dllRefs, htmls)
  })
}
