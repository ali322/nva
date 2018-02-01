let webpack = require('webpack')
let { join, resolve, sep, extname } = require('path')
let forEach = require('lodash/forEach')
let isPlainObject = require('lodash/isPlainObject')
let InjectHtmlPlugin = require('inject-html-webpack-plugin')
let ProgressPlugin = require('progress-webpack-plugin')
let ChunkTransformPlugin = require('chunk-transform-webpack-plugin')
let { bundleTime, merge } = require('../common/helper')
let { config: configFactory } = require('nva-core')

module.exports = function (context, profile) {
  let {
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
  let transforms = []
  let baseConfig = configFactory(context, profile)

  /** add vendors reference */
  let dllRefs = []

  let sourcemapPath = resolve(output.vendorPath, vendorSourceMap)
  let sourcemap = require(sourcemapPath).output
  if (isPlainObject(vendors.js)) {
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
  }

  /** build modules */
  forEach(mods, (mod, name) => {
    entry[name] = [mod.input.js].concat(mod.input.css ? [mod.input.css] : [])
    let chunks = [name]

    transforms.push(
      new ChunkTransformPlugin({
        chunks: [name],
        test: /\.(js|css)$/,
        filename: file =>
          extname(file) === '.js'
            ? mod.output.js || file
            : mod.output.css || file
      })
    )

    let more = { js: [], css: [] }
    if (mod.vendor) {
      if (mod.vendor.js && sourcemap.js && sourcemap.js[mod.vendor.js]) {
        more.js = [join(sep, vendorFolder, sourcemap.js[mod.vendor.js])]
      }
      if (mod.vendor.css && sourcemap.css && sourcemap.css[mod.vendor.css]) {
        more.css = [join(sep, vendorFolder, sourcemap.css[mod.vendor.css])]
      }
    }
    htmls.push(
      new InjectHtmlPlugin({
        transducer: sep,
        chunks,
        filename: mod.input.html,
        more,
        customInject: [
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
    plugins: baseConfig.plugins.concat([
      new ProgressPlugin(true, { onProgress: context.onBuildProgress }),
    ]).concat(transforms, dllRefs, htmls)
  })
}
