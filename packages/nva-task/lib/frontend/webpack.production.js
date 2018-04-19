const { DllReferencePlugin } = require('webpack')
const { join, resolve, dirname, extname } = require('path')
const forEach = require('lodash/forEach')
const isPlainObject = require('lodash/isPlainObject')
const isFunction = require('lodash/isFunction')
const InjectHtmlPlugin = require('inject-html-webpack-plugin')
const ProgressPlugin = require('progress-webpack-plugin')
const ContentReplacePlugin = require('content-replace-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const ChunkAssetPlugin = require('chunk-asset-webpack-plugin')
const TidyStatsPlugin = require('tidy-stats-webpack-plugin')
const { existsSync } = require('fs-extra')
const { config: configFactory } = require('nva-core')
const { relativeURL, bundleTime, merge } = require('../common/helper')

module.exports = (context, profile) => {
  const {
    vendors,
    mods,
    outputPrefix,
    sourceFolder,
    distFolder,
    staticFolder,
    staticPrefix,
    chunkFolder,
    vendorSourceMap,
    output
  } = context
  /** build variables */
  let entry = {}
  let htmls = []
  let transforms = {}
  let contentExternals = []
  const baseConfig = configFactory(context, profile)

  /** build vendors */
  let dllRefs = []
  const sourcemapPath = resolve(output.vendorPath, vendorSourceMap)
  const sourcemap = require(sourcemapPath).output
  if (isPlainObject(vendors.js)) {
    for (let key in vendors['js']) {
      let manifestPath = resolve(output.vendorPath, key + '-manifest.json')
      let manifest = require(manifestPath)
      dllRefs.push(
        new DllReferencePlugin({
          context: __dirname,
          manifest
        })
      )
    }
  }

  /** build modules */
  forEach(mods, (mod, name) => {
    entry[name] = [mod.input.js].concat(mod.input.css ? [mod.input.css] : [])
    let chunks = [name]
    transforms[name] = files =>
      files.map(file => {
        let outputFile = mod.output[extname(file).replace('.', '')]
        return outputFile || file
      })

    let more = { js: [], css: [] }
    const htmlOutput = mod.output.html
    if (mod.vendor) {
      if (mod.vendor.js && sourcemap.js && sourcemap.js[mod.vendor.js]) {
        let originalURL = join(output.vendorPath, sourcemap.js[mod.vendor.js])
        more.js = [
          isFunction(outputPrefix)
            ? outputPrefix(originalURL)
            : outputPrefix + relativeURL(dirname(htmlOutput), originalURL)
        ]
      }
      if (mod.vendor.css && sourcemap.css && sourcemap.css[mod.vendor.css]) {
        let originalURL = join(output.vendorPath, sourcemap.css[mod.vendor.css])
        more.css = [
          isFunction(outputPrefix)
            ? outputPrefix(originalURL)
            : outputPrefix + relativeURL(dirname(htmlOutput), originalURL)
        ]
      }
    }
    contentExternals.push(mod.output.html)
    htmls.push(
      new InjectHtmlPlugin({
        transducer: function(url) {
          return isFunction(outputPrefix)
            ? outputPrefix(url)
            : outputPrefix +
                relativeURL(dirname(htmlOutput), join(distFolder, url))
        },
        more,
        chunks,
        filename: mod.input.html,
        output: htmlOutput,
        customInject: [
          {
            start: '<!-- start:bundle-time -->',
            end: '<!-- end:bundle-time -->',
            content: `<meta name="bundleTime" content="${bundleTime()}"/>`
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
      .concat(
      [
        new ProgressPlugin(true, { onProgress: context.onBuildProgress }),
        new ChunkAssetPlugin({
          chunks: transforms
        }),
        new ContentReplacePlugin({
          external: contentExternals,
          rules: {
            '**/*.js': content =>
                content.replace(
                  RegExp(
                    `\\/${staticFolder}(\\/[A-Za-z0-9-_\\.\\/"\\+]+\\.[A-Za-z]+)`,
                    'gi'
                  ),
                  `${staticPrefix}/${staticFolder}$1`
                ),
            '**/*.css': content =>
                content.replace(
                  RegExp(
                    `(url\\s*\\(\\s*['"])\\/${staticFolder}(\\/[A-Za-z0-9-_\\.\\/]+['"]\\s*\\))`,
                    'gi'
                  ),
                  `$1${staticPrefix}/${staticFolder}$2`
                ),
            '**/*.html': content =>
                content.replace(
                  RegExp(
                    `([href|src]=["'])\\/${staticFolder}(\\/[A-Za-z0-9-_\\.\\/]+\\.[A-Za-z]+["'])`,
                    'gi'
                  ),
                  `$1${staticPrefix}/${staticFolder}$2`
                )
          }
        }),
        new TidyStatsPlugin()
      ],
        dllRefs,
        htmls
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
}
