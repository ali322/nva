const { resolve, join, extname } = require('path')
const { DllPlugin } = require('webpack')
const ProgressPlugin = require('progress-webpack-plugin')
const ChunkAssetPlugin = require('chunk-asset-webpack-plugin')
const TidyStatsPlugin = require('tidy-stats-webpack-plugin')
const fromPairs = require('lodash/fromPairs')
const map = require('lodash/map')
const isEmpty = require('lodash/isEmpty')
const { merge } = require('nva-util')
const configFactory = require('../webpack/config')

module.exports = function(context) {
  const {
    vendors,
    sourceFolder,
    vendorFolder,
    vendorDevFolder,
    output,
    isDev,
    logText
  } = context
  const baseConfig = configFactory(context)

  let entryJS = {}
  let entryCSS = {}
  let cssChunks = []
  let vendorConfig = []
  for (let key in vendors['js']) {
    entryJS[key] = vendors['js'][key]
  }
  for (let key in vendors['css']) {
    cssChunks.push(key)
    entryCSS[key] = vendors['css'][key]
  }

  const jsConfig = merge(baseConfig, {
    // devtool: false,
    name: 'js',
    entry: entryJS,
    output: {
      path: resolve(isDev ? output.vendorDevPath : output.vendorPath),
      filename: '[name]-[contenthash].js',
      library: '[name]_[contenthash]',
      libraryTarget: 'umd'
    },
    resolve: {
      modules: [sourceFolder, 'node_modules', resolve('node_modules')]
    },
    plugins: baseConfig.plugins.slice(0, -1).concat([
      new ProgressPlugin({ identifier: 'vendor:js' }),
      new DllPlugin({
        name: '[name]_[contenthash]',
        path: resolve(
          isDev ? output.vendorDevPath : output.vendorPath,
          '[name]-manifest.json'
        ),
        context: resolve()
      }),
      new TidyStatsPlugin({
        identifier: 'vendor:js',
        logText: {
          success: logText.buildSuccess,
          warn: logText.buildWarn,
          error: logText.buildError
        }
      })
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
          '[name]-[contenthash].css'
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
      new ProgressPlugin({ identifier: 'vendor:css' }),
      new ChunkAssetPlugin({
        chunks: fromPairs(
          map(cssChunks, chunk => {
            return [chunk, files => files.filter(v => extname(v) !== '.js')]
          })
        )
      }),
      new TidyStatsPlugin({
        identifier: 'vendor:css',
        logText: {
          success: logText.buildSuccess,
          warn: logText.buildWarn,
          error: logText.buildError
        }
      })
    ])
  })

  if (!isEmpty(entryCSS)) {
    vendorConfig.push(cssConfig)
  }

  return vendorConfig
}
