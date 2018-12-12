const { DllReferencePlugin } = require('webpack')
const { join, resolve, dirname, extname } = require('path')
const forEach = require('lodash/forEach')
const isFunction = require('lodash/isFunction')
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
  let dllRefs = []
  let transforms = {}
  let contentExternals = []
  const baseConfig = configFactory(context, profile)
  const sourcemapPath = resolve(output.vendorPath, vendorSourceMap)
  const sourcemap = require(sourcemapPath).output

  const vendorAssets = (modVendor, htmlOutput, type) => {
    if (Array.isArray(modVendor[type])) {
      return modVendor[type].map(k => {
        let originalURL = join(output.vendorPath, sourcemap[type][k])
        return isFunction(outputPrefix)
        ? outputPrefix(originalURL)
        : outputPrefix + relativeURL(dirname(htmlOutput), originalURL)
      })
    }
    let originalURL = join(output.vendorPath, sourcemap[type][modVendor[type]])
    return [
      isFunction(outputPrefix)
            ? outputPrefix(originalURL)
            : outputPrefix + relativeURL(dirname(htmlOutput), originalURL)
    ]
  }

  /** build vendors */
  for (let key in vendors['js']) {
    let manifestPath = resolve(output.vendorPath, `${key}-manifest.json`)
    let manifest = require(manifestPath)
    dllRefs.push(
      new DllReferencePlugin({
        context: __dirname,
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

    const htmlOutput = mod.output.html
    contentExternals.push(mod.output.html)
    htmls.push(
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
                  isFunction(staticPrefix) ? `${staticPrefix(staticFolder)}$1` : `${staticPrefix}/${staticFolder}$1`
                ),
            '**/*.css': content =>
                content.replace(
                  RegExp(
                    `(url\\s*\\(\\s*['"])\\/${staticFolder}(\\/[A-Za-z0-9-_\\.\\/]+['"]\\s*\\))`,
                    'gi'
                  ),
                  isFunction(staticPrefix) ? `$1${staticPrefix(staticFolder)}$2` : `$1${staticPrefix}/${staticFolder}$2`
                ),
            '**/*.html': content =>
                content.replace(
                  RegExp(
                    `([href|src]=["'])\\/${staticFolder}(\\/[A-Za-z0-9-_\\.\\/]+\\.[A-Za-z]+["'])`,
                    'gi'
                  ),
                  isFunction(staticPrefix) ? `$1${staticPrefix(staticFolder)}$2` : `$1${staticPrefix}/${staticFolder}$2`
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
