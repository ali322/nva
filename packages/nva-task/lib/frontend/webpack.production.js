const { DllReferencePlugin } = require('webpack')
const { join, resolve, dirname, extname } = require('path')
const forEach = require('lodash/forEach')
const isFunction = require('lodash/isFunction')
const isPlainObject = require('lodash/isPlainObject')
const InjectHtmlPlugin = require('inject-html-webpack-plugin')
const ProgressPlugin = require('progress-webpack-plugin')
const ContentReplacePlugin = require('content-replace-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const ChunkAssetPlugin = require('chunk-asset-webpack-plugin')
const TidyStatsPlugin = require('tidy-stats-webpack-plugin')
const { existsSync } = require('fs-extra')
const { relativeURL, bundleTime, merge } = require('nva-util')
const configFactory = require('../webpack/config')

module.exports = (context, profile) => {
  const {
    mods,
    outputPrefix,
    sourceFolder,
    distFolder,
    staticFolder,
    staticPrefix,
    chunkFolder,
    vendorSourceMap,
    output,
    logText
  } = context
  /** build variables */
  let confs = []
  const baseConfig = configFactory(context, profile)
  const sourcemap = require(resolve(output.vendorPath, vendorSourceMap)).output

  const vendorAssets = (modVendor, htmlOutput, type) => {
    if (isPlainObject(sourcemap[type])) {
      if (Array.isArray(modVendor[type])) {
        return modVendor[type]
          .filter(k => typeof sourcemap[type][k] === 'string')
          .map(k => {
            let originalURL = join(output.vendorPath, sourcemap[type][k])
            return isFunction(outputPrefix)
              ? outputPrefix(originalURL)
              : outputPrefix + relativeURL(dirname(htmlOutput), originalURL)
          })
      }
      let originalURL = join(
        output.vendorPath,
        sourcemap[type][modVendor[type]]
      )
      return typeof sourcemap[type][modVendor[type]] === 'string'
        ? [
          isFunction(outputPrefix)
            ? outputPrefix(originalURL)
            : outputPrefix + relativeURL(dirname(htmlOutput), originalURL)
        ]
        : []
    }
    return []
  }

  /** build modules */
  forEach(mods, (mod, name) => {
    let entry = {
      [name]: [].concat(mod.input.css ? [mod.input.css] : []).concat([mod.input.js])
    }

    const htmlOutput = mod.output.html

    let dllRefs = (Array.isArray(mod.vendor.js)
      ? mod.vendor.js
      : [mod.vendor.js]
    ).map(key => {
      let manifestPath = resolve(output.vendorPath, `${key}-manifest.json`)
      let manifest = require(manifestPath)
      return new DllReferencePlugin({
        context: resolve(),
        manifest
      })
    })

    confs.push(
      merge(baseConfig, {
        entry,
        name,
        output: {
          path: output.path,
          filename: join('[name]', '[name]-[contenthash].js'),
          chunkFilename: join(chunkFolder, '[id]-[contenthash].chunk.js')
        },
        resolveLoader: {
          modules: [resolve('node_modules'), 'node_modules']
        },
        resolve: {
          modules: [sourceFolder, resolve('node_modules'), 'node_modules']
        },
        plugins: baseConfig.plugins
          .concat(
            [
              new ProgressPlugin({
                identifier: name,
                onProgress: context.onBuildProgress
              }),
              new ChunkAssetPlugin({
                chunks: {
                  [name]: files =>
                    files.map(file => {
                      let outputFile =
                        mod.output[extname(file).replace('.', '')]
                      return outputFile || file
                    })
                }
              }),
              new ContentReplacePlugin({
                external: [htmlOutput],
                rules: {
                  '**/*.js': (content, file) =>
                    content.replace(
                      RegExp(
                        `\\/${staticFolder}(\\/[A-Za-z0-9-_\\.\\/"\\+]+\\.[A-Za-z]+)`,
                        'gi'
                      ),
                      isFunction(staticPrefix)
                        ? `${staticPrefix(staticFolder, file)}$1`
                        : `${staticPrefix}/${staticFolder}$1`
                    ),
                  '**/*.css': (content, file) =>
                    content.replace(
                      RegExp(
                        `(url\\s*\\(\\s*['"]?)\\/${staticFolder}(\\/[A-Za-z0-9-_\\.\\/]+['"]?\\s*\\))`,
                        'gi'
                      ),
                      isFunction(staticPrefix)
                        ? `$1${staticPrefix(staticFolder, file)}$2`
                        : `$1${staticPrefix}/${staticFolder}$2`
                    ),
                  '**/*.html': (content, file) =>
                    content.replace(
                      RegExp(
                        `([href|src]=["'])\\/${staticFolder}(\\/[A-Za-z0-9-_\\.\\/]+\\.[A-Za-z]+["'])`,
                        'gi'
                      ),
                      isFunction(staticPrefix)
                        ? `$1${staticPrefix(staticFolder, file)}$2`
                        : `$1${staticPrefix}/${staticFolder}$2`
                    )
                }
              }),
              new InjectHtmlPlugin({
                transducer: function(url) {
                  return isFunction(outputPrefix)
                    ? outputPrefix(url)
                    : outputPrefix +
                        relativeURL(dirname(htmlOutput), join(distFolder, url))
                },
                chunks: [name],
                more: {
                  js: vendorAssets(mod.vendor, htmlOutput, 'js'),
                  css: vendorAssets(mod.vendor, htmlOutput, 'css')
                },
                filename: mod.input.html,
                output: htmlOutput,
                custom: [
                  {
                    start: '<!-- start:bundle-time -->',
                    end: '<!-- end:bundle-time -->',
                    content: `<meta name="bundleTime" content="${bundleTime()}"/>`
                  }
                ]
              }),
              new TidyStatsPlugin({
                identifier: name,
                logText: {
                  success: logText.buildSuccess,
                  warn: logText.buildWarn,
                  error: logText.buildError
                }
              })
            ],
            dllRefs
          )
          .concat(
            existsSync(resolve(staticFolder))
              ? new CopyPlugin([
                {
                  from: resolve(staticFolder),
                  to: join(output.path, staticFolder),
                  ignore: ['.*']
                }
              ])
              : []
          )
      })
    )
  })

  return confs
}
