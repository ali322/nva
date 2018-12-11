const webpack = require('webpack')
const { join, resolve, sep, extname, posix } = require('path')
const forEach = require('lodash/forEach')
const InjectHtmlPlugin = require('inject-html-webpack-plugin')
const ProgressPlugin = require('progress-webpack-plugin')
const ChunkAssetPlugin = require('chunk-asset-webpack-plugin')
const TidyStatsPlugin = require('tidy-stats-webpack-plugin')
const { bundleTime, merge } = require('nva-util')
const configFactory = require('../webpack/config')

module.exports = function(context, profile) {
  const {
    vendors,
    mods,
    sourceFolder,
    chunkFolder,
    vendorFolder,
    vendorSourceMap,
    output
  } = context
  /** build variables */
  let entry = {}
  let htmls = []
  let transforms = {}
  let dllRefs = []
  const baseConfig = configFactory(context, profile)
  /** add vendors reference */

  const sourcemapPath = resolve(output.vendorPath, vendorSourceMap)
  const sourcemap = require(sourcemapPath).output
  const vendorAssets = (modVendor, type) => {
    return [
      posix.join(posix.sep, vendorFolder, sourcemap[type][modVendor[type]])
    ]
  }

  for (let key in vendors['js']) {
    let manifestPath = resolve(output.vendorPath, key + '-manifest.json')
    let manifest = require(manifestPath)
    dllRefs.push(
      new webpack.DllReferencePlugin({
        context: resolve(sourceFolder),
        manifest
      })
    )
  }

  /** build modules */
  forEach(mods, (mod, name) => {
    entry[name] = [mod.input.js].concat(mod.input.css ? [mod.input.css] : [])

    transforms[name] = files =>
      files.map(file => {
        let outputFile = mod.output[extname(file).replace('.', '')]
        return outputFile || file
      })

    htmls.push(
      new InjectHtmlPlugin({
        transducer: sep,
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
    )
  })

  return merge(baseConfig, {
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
          chunks: transforms
        }),
        new TidyStatsPlugin()
      ])
      .concat(dllRefs, htmls)
  })
}
