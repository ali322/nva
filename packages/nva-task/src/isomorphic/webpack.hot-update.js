import webpack from 'webpack'
import { resolve, posix } from 'path'
import { forEach, isPlainObject } from 'lodash'
import InjectHtmlPlugin from 'inject-html-webpack-plugin'
import ProgressPlugin from 'progress-webpack-plugin'
import TidyErrorsPlugin from 'tidy-errors-webpack-plugin'
import { config as configFactory } from 'nva-core'
import { serverHost } from '../lib'

export default function (context, profile) {
  const {
    vendors,
    mods,
    sourceFolder,
    vendorFolder,
    vendorSourceMap,
    hmrPath,
    port,
    output
  } = context
  /** build variables */
  let entry = {}
  let htmls = []
  let devServerHost = serverHost(port)
  let baseConfig = configFactory({ ...context, isDev: true }, profile)

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
    entry[name] = [
      require.resolve('webpack-hot-middleware/client') +
        '?path=' +
        devServerHost +
        '/__webpack_hmr',
      mod.input.js
    ].concat(mod.input.css ? [mod.input.css] : [])
    let chunks = [name]

    let more = { js: [], css: [] }
    if (mod.vendor) {
      if (mod.vendor.js && sourcemap.js && sourcemap.js[mod.vendor.js]) {
        more.js = [
          posix.join(posix.sep, vendorFolder, sourcemap.js[mod.vendor.js])
        ]
      }
      if (mod.vendor.css && sourcemap.css && sourcemap.css[mod.vendor.css]) {
        more.css = [
          posix.join(posix.sep, vendorFolder, sourcemap.css[mod.vendor.css])
        ]
      }
    }
    htmls.push(
      new InjectHtmlPlugin({
        transducer: devServerHost + hmrPath,
        chunks,
        filename: mod.input.html,
        more,
        customInject: [
          {
            start: '<!-- start:browser-sync -->',
            end: '<!-- end:browser-sync -->',
            content:
              '<script src="' +
              devServerHost +
              '/bs/browser-sync-client.js"></script>'
          }
        ]
      })
    )
  })

  return {
    ...baseConfig,
    entry,
    output: {
      path: output.path,
      filename: '[name].js',
      chunkFilename: '[id].chunk.js',
      publicPath: devServerHost + hmrPath
    },
    // context: __dirname,
    resolveLoader: {
      modules: [resolve('node_modules'), 'node_modules']
    },
    resolve: {
      modules: [sourceFolder, resolve('node_modules'), 'node_modules']
    },
    plugins: [
      ...baseConfig.plugins.slice(1),
      new ProgressPlugin(true, { onProgress: context.onDevProgress }),
      new TidyErrorsPlugin({ clearConsole: false, errorsOnly: true }),
      ...dllRefs,
      ...htmls
    ]
  }
}
