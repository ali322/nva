const { DllReferencePlugin } = require('webpack')
const { join, resolve, posix } = require('path')
const forEach = require('lodash/forEach')
const isPlainObject = require('lodash/isPlainObject')
const InjectHtmlPlugin = require('inject-html-webpack-plugin')
const TidyStatsPlugin = require('tidy-stats-webpack-plugin')
const ProgressPlugin = require('progress-webpack-plugin')
const { config: configFactory } = require('nva-core')
const { merge } = require('../common/helper')

module.exports = function(context, profile) {
  const {
    vendors,
    mods,
    sourceFolder,
    distFolder,
    chunkFolder,
    vendorDevFolder,
    vendorSourceMap,
    hmrPath,
    output
  } = context
  /** build variables */
  let entry = {}
  let htmls = []
  const baseConfig = configFactory(merge(context, { isDev: true }), profile)

  /* build vendors */
  let dllRefs = []
  const sourcemapPath = resolve(output.vendorDevPath, vendorSourceMap)
  const sourcemap = require(sourcemapPath).output
  if (isPlainObject(vendors.js)) {
    for (let key in vendors['js']) {
      let manifestPath = resolve(output.vendorDevPath, `${key}-manifest.json`)
      let manifest = require(manifestPath)
      dllRefs.push(
        new DllReferencePlugin({
          context: __dirname,
          manifest
        })
      )
    }
  }

  /** build modules */
  forEach(mods, (mod, name) => {
    entry[name] = [
      require.resolve('webpack-hot-middleware/client') + '?reload=true',
      mod.input.js
    ].concat(mod.input.css ? [mod.input.css] : [])

    let chunks = [name]
    let more = { js: [], css: [] }
    if (mod.vendor) {
      if (mod.vendor.js && sourcemap.js && sourcemap.js[mod.vendor.js]) {
        more.js = [
          posix.join(
            posix.sep,
            distFolder,
            vendorDevFolder,
            sourcemap.js[mod.vendor.js]
          )
        ]
      }
      if (mod.vendor.css && sourcemap.css && sourcemap.css[mod.vendor.css]) {
        more.css = [
          posix.join(
            posix.sep,
            distFolder,
            vendorDevFolder,
            sourcemap.css[mod.vendor.css]
          )
        ]
      }
    }
    htmls.push(
      new InjectHtmlPlugin({
        transducer: hmrPath,
        chunks,
        filename: mod.input.html,
        more
      })
    )
  })

  return merge(baseConfig, {
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
    resolveLoader: {
      modules: ['node_modules', resolve('node_modules')]
    },
    resolve: {
      modules: [sourceFolder, resolve('node_modules'), 'node_modules']
    },
    plugins: baseConfig.plugins.concat(dllRefs, htmls, [
      new ProgressPlugin(true, { onProgress: context.onDevProgress }),
      new TidyStatsPlugin({ ignoreAssets: true })
    ])
  })
}
