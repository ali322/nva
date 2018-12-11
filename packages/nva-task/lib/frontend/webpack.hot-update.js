const { DllReferencePlugin } = require('webpack')
const { join, resolve, posix } = require('path')
const forEach = require('lodash/forEach')
const isPlainObject = require('lodash/isPlainObject')
const InjectHtmlPlugin = require('inject-html-webpack-plugin')
const TidyStatsPlugin = require('tidy-stats-webpack-plugin')
const ProgressPlugin = require('progress-webpack-plugin')
const { merge } = require('nva-util')
const configFactory = require('../webpack/config')

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
    output,
    afterInject
  } = context
  /** build variables */
  let entry = {}
  let htmls = []
  const baseConfig = configFactory(merge(context, { isDev: true }), profile)

  const vendorAssets = (modVendor, type) => {
    return [
      posix.join(
        posix.sep,
        distFolder,
        vendorDevFolder,
        sourcemap[type][modVendor[type]]
      )
    ]
  }

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

    htmls.push(
      new InjectHtmlPlugin({
        transducer: hmrPath,
        chunks: [name],
        filename: mod.input.html,
        output: afterInject,
        more: {
          js: vendorAssets(mod.vendor, 'js'),
          css: vendorAssets(mod.vendor, 'css')
        }
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
