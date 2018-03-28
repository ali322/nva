let { DllReferencePlugin } = require('webpack')
let { join, resolve, posix } = require('path')
let forEach = require('lodash/forEach')
let isPlainObject = require('lodash/isPlainObject')
let InjectHtmlPlugin = require('inject-html-webpack-plugin')
let TidyStatsPlugin = require('tidy-stats-webpack-plugin')
let ProgressPlugin = require('progress-webpack-plugin')
let { config: configFactory } = require('nva-core')
let { merge } = require('../common/helper')

module.exports = function (context, profile) {
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
  let baseConfig = configFactory(merge(context, { isDev: true }), profile)

  /* build vendors */
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
      require.resolve('webpack-hot-middleware/client'),
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
      if (
        mod.vendor.css &&
        sourcemap.css &&
        sourcemap.css[mod.vendor.css]
      ) {
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
      new TidyStatsPlugin({ignoreAssets: true})
    ])
  })
}