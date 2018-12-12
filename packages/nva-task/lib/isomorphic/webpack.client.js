const webpack = require('webpack')
const { join, resolve, extname, posix } = require('path')
const forEach = require('lodash/forEach')
const InjectHtmlPlugin = require('inject-html-webpack-plugin')
const ProgressPlugin = require('progress-webpack-plugin')
const ChunkAssetPlugin = require('chunk-asset-webpack-plugin')
const TidyStatsPlugin = require('tidy-stats-webpack-plugin')
const { bundleTime, merge } = require('nva-util')
const configFactory = require('../webpack/config')

module.exports = function(context, profile) {
  const {
    mods,
    sourceFolder,
    chunkFolder,
    vendorFolder,
    vendorSourceMap,
    output
  } = context
  /** build variables */
  let confs = []
  const baseConfig = configFactory(context, profile)
  const sourcemap = require(resolve(output.vendorPath, vendorSourceMap)).output

  const vendorAssets = (modVendor, type) => {
    if (Array.isArray(modVendor[type])) {
      return modVendor[type].map(k =>
        posix.join(posix.sep, vendorFolder, sourcemap[type][k])
      )
    }
    return [
      posix.join(posix.sep, vendorFolder, sourcemap[type][modVendor[type]])
    ]
  }

  /** build modules */
  forEach(mods, (mod, name) => {
    let entry = {
      [name]: [mod.input.js].concat(mod.input.css ? [mod.input.css] : [])
    }

    let dllRefs = (Array.isArray(mod.vendor.js)
      ? mod.vendor.js
      : [mod.vendor.js]
    ).map(key => {
      let manifestPath = resolve(output.vendorPath, key + '-manifest.json')
      let manifest = require(manifestPath)
      return new webpack.DllReferencePlugin({
        context: resolve(sourceFolder),
        manifest
      })
    })

    confs.push(
      merge(baseConfig, {
        entry,
        output: {
          path: output.path,
          filename: join('[name]', '[name]-[hash:8].js'),
          chunkFilename: join(chunkFolder, '[id]-[hash:8].chunk.js')
        },
        // context: __dirname,
        resolveLoader: {
          modules: [resolve('node_modules'), 'node_modules']
        },
        resolve: {
          modules: [sourceFolder, resolve('node_modules'), 'node_modules']
        },
        plugins: baseConfig.plugins
          .concat([
            new ProgressPlugin(true, { onProgress: context.onBuildProgress }),
            new ChunkAssetPlugin({
              chunks: {
                [name]: files =>
                  files.map(file => {
                    let outputFile = mod.output[extname(file).replace('.', '')]
                    return outputFile || file
                  })
              }
            }),
            new TidyStatsPlugin(),
            new InjectHtmlPlugin({
              transducer: posix.sep,
              chunks: [name],
              filename: mod.input.html,
              more: {
                js: vendorAssets(mod.vendor, 'js'),
                css: vendorAssets(mod.vendor, 'css')
              },
              custom: [
                {
                  start: '<!-- start:bundle-time -->',
                  end: '<!-- end:bundle-time -->',
                  content: `<meta name="bundleTime" content="${bundleTime()}"/>`
                },
                {
                  start: '<!-- start:browser-sync -->',
                  end: '<!-- end:browser-sync -->',
                  content: ''
                }
              ]
            })
          ])
          .concat(dllRefs)
      })
    )
  })

  return confs
}
