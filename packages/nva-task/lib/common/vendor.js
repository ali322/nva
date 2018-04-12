const { resolve, join, extname } = require('path')
const { DllPlugin } = require('webpack')
const ProgressPlugin = require('progress-webpack-plugin')
const ChunkAssetPlugin = require('chunk-asset-webpack-plugin')
const TidyStatsPlugin = require('tidy-stats-webpack-plugin')
const fromPairs = require('lodash/fromPairs')
const map = require('lodash/map')
const isEmpty = require('lodash/isEmpty')
const isPlainObject = require('lodash/isPlainObject')
const { merge } = require('../common/helper')
const { config: configFactory } = require('nva-core')

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
