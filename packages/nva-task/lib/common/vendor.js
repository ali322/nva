let { resolve, join, basename } = require('path')
let { DllPlugin } = require('webpack')
let ChunkTransformPlugin = require('chunk-transform-webpack-plugin')
let ProgressPlugin = require('progress-webpack-plugin')
let isEmpty = require('lodash/isEmpty')
let isPlainObject = require('lodash/isPlainObject')
let { merge } = require('../common/helper')
let { config: configFactory } = require('nva-core')

module.exports = function (context) {
  const {
    vendors,
    sourceFolder,
    vendorFolder,
    vendorDevFolder,
    output,
    isDev
    } = context
  const baseConfig = configFactory(context)

  let entryJS = {},
    entryCSS = {},
    cssChunks = [],
    vendorConfig = []
  if (isPlainObject(vendors['js'])) {
    for (let key in vendors['js']) {
      entryJS[key] = vendors['js'][key]
    }
  }
  if (isPlainObject(vendors['css'])) {
    for (let key in vendors['css']) {
      cssChunks.push(key)
      entryCSS[key] = vendors['css'][key]
    }
  }

  const jsConfig = merge(baseConfig, {
    // devtool: false,
    name: 'js',
    entry: entryJS,
    output: {
      path: resolve(isDev ? output.vendorDevPath : output.vendorPath),
      filename: '[name]-[hash:8].js',
      library: '[name]_[hash]'
    },
    resolve: {
      modules: [sourceFolder, 'node_modules', resolve('node_modules')]
    },
    plugins: baseConfig.plugins.slice(0, -1).concat([
      new ProgressPlugin(true, { identifier: 'vendor:js' }),
      new DllPlugin({
        name: '[name]_[hash]',
        path: resolve(
          isDev ? output.vendorDevPath : output.vendorPath,
          '[name]-manifest.json'
        ),
        context: __dirname
      })
    ])
  })

  if (!isEmpty(entryJS)) {
    vendorConfig.push(jsConfig)
  }

  const baseCSSConfig = configFactory(merge(context, {
    isDev: false
  }))
  const cssConfig = merge(baseCSSConfig, {
    name: 'css',
    entry: entryCSS,
    resolve: {
      modules: [sourceFolder, 'node_modules', resolve('node_modules')]
    },
    output: {
      path: output.path
    },
    plugins: baseCSSConfig.plugins.concat([
      new ProgressPlugin(true, { identifier: 'vendor:css' }),
      new ChunkTransformPlugin({
        chunks: cssChunks,
        test: /\.css$/,
        filename: function (filename) {
          return join(
            isDev ? vendorDevFolder : vendorFolder,
            basename(filename)
          )
        }
      })
    ])
  })

  if (!isEmpty(entryCSS)) {
    vendorConfig.push(cssConfig)
  }

  return vendorConfig
}
