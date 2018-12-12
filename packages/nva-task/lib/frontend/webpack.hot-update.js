const { DllReferencePlugin } = require('webpack')
const { join, resolve, posix } = require('path')
const forEach = require('lodash/forEach')
const InjectHtmlPlugin = require('inject-html-webpack-plugin')
const TidyStatsPlugin = require('tidy-stats-webpack-plugin')
const ProgressPlugin = require('progress-webpack-plugin')
const { merge } = require('nva-util')
const configFactory = require('../webpack/config')

module.exports = function(context, profile) {
  const {
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
  let confs = []
  const baseConfig = configFactory(merge(context, { isDev: true }), profile)
  const sourcemap = require(resolve(output.vendorDevPath, vendorSourceMap)).output

  const vendorAssets = (modVendor, type) => {
    if (Array.isArray(modVendor[type])) {
      return modVendor[type].map(k => posix.join(
        posix.sep,
        distFolder,
        vendorDevFolder,
        sourcemap[type][k]
      ))
    }
    return [
      posix.join(
        posix.sep,
        distFolder,
        vendorDevFolder,
        sourcemap[type][modVendor[type]]
      )
    ]
  }

  /** build modules */
  forEach(mods, (mod, name) => {
    entry[name] = [
      require.resolve('webpack-hot-middleware/client') + `?name=${name}`,
      mod.input.js
    ].concat(mod.input.css ? [mod.input.css] : [])

    let dllRefs = (Array.isArray(mod.vendor.js) ? mod.vendor.js : [mod.vendor.js]).map(key => {
      let manifestPath = resolve(output.vendorDevPath, `${key}-manifest.json`)
      let manifest = require(manifestPath)
      return new DllReferencePlugin({
        context: __dirname,
        manifest
      })
    })

    confs.push(merge(baseConfig, {
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
      plugins: baseConfig.plugins.concat(dllRefs, [
        new ProgressPlugin(true, { onProgress: context.onDevProgress }),
        new TidyStatsPlugin({ ignoreAssets: true }),
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
      ])
    }))
  })

  return confs
}
