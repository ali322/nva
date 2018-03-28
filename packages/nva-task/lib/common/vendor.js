let { resolve, join, basename, extname } = require('path')
let { DllPlugin } = require('webpack')
let ProgressPlugin = require('progress-webpack-plugin')
let ChunkAssetPlugin = require('chunk-asset-webpack-plugin')
let TidyStatsPlugin = require('tidy-stats-webpack-plugin')
let fromPairs = require('lodash/fromPairs')
let map = require('lodash/map')
let isEmpty = require('lodash/isEmpty')
let isPlainObject = require('lodash/isPlainObject')
let { merge } = require('../common/helper')
let { config: configFactory } = require('nva-core')

module.exports = function(context) {
  const {
    vendors,
    sourceFolder,
    vendorFolder,
    vendorDevFolder,
    output,
    isDev
  } = context
  const baseConfig = configFactory(context)

  let entryJS = {}
  let entryCSS = {}
  let cssChunks = []
  let vendorConfig = []
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
      }),
      new TidyStatsPlugin({ identifier: 'vendor:js' })
    ])
  })

  if (!isEmpty(entryJS)) {
    vendorConfig.push(jsConfig)
  }

  const baseCSSConfig = configFactory(
    merge(context, {
      output: merge(output, {
        cssPath: join(
          isDev ? vendorDevFolder : vendorFolder,
          '[name]-[hash:8].css'
        )
      }),
      isDev: false
    })
  )
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
      new ChunkAssetPlugin({
        chunks: fromPairs(
          map(cssChunks, chunk => {
            return [chunk, files => files.filter(v => extname(v) !== '.js')]
          })
        )
      }),
      new TidyStatsPlugin({ identifier: 'vendor:css' })
    ])
  })

  if (!isEmpty(entryCSS)) {
    vendorConfig.push(cssConfig)
  }

  return vendorConfig
}
