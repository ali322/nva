const HappyPack = require('happypack')
const os = require('os')
const assign = require('lodash/assign')
const isPlainObject = require('lodash/isPlainObject')
const autoPrefixer = require('autoprefixer')
const MiniCSSExtractPlugin = require('mini-css-extract-plugin')

const compilerThreadPool = HappyPack.ThreadPool({ size: os.cpus().length })

const mergeLoaderOptions = (defaults, options) => {
  return isPlainObject(options) ? assign({}, defaults, options) : defaults
}

exports.happypackPlugin = (id, loaders) => {
  return new HappyPack({
    id,
    verbose: false,
    threadPool: compilerThreadPool,
    loaders
  })
}

exports.postcssOptions = context => {
  const { loaderOptions } = context
  return mergeLoaderOptions({
    plugins: [autoPrefixer()],
    sourceMap: 'inline'
  }, loaderOptions.postcss)
}

exports.vueStyleLoaders = (context, preprocessor) => {
  let loaders = exports.cssLoaders(
    assign({}, context, { isDev: true }),
    preprocessor
  )
  loaders = loaders.filter((v, i) => i > 0 && i !== 2)
  return context.isDev
    ? ['vue-style-loader'].concat(loaders)
    : [MiniCSSExtractPlugin.loader].concat(loaders)
}

exports.cssLoaders = (context, preprocessor = '') => {
  const { loaderOptions, isDev } = context
  const useLegacyVueLoader = !!(loaderOptions.vue && loaderOptions.vue.legacy)
  let loaders = [
    {
      loader: !useLegacyVueLoader
        ? 'vue-style-loader'
        : require.resolve('style-loader')
    },
    {
      loader: require.resolve('css-loader'),
      options: mergeLoaderOptions(loaderOptions.css)
    },
    {
      loader: require.resolve('postcss-loader'),
      options: exports.postcssOptions(context)
    },
    {
      loader: require.resolve('resolve-url-loader'),
      options: mergeLoaderOptions({debug: false}, loaderOptions.resolveURL)
    }
  ]
  if (preprocessor) {
    if (typeof preprocessor === 'string') {
      loaders = loaders.concat([
        {
          loader: require.resolve(`${preprocessor}-loader`),
          options: mergeLoaderOptions({ sourceMap: true }, loaderOptions[preprocessor])
        }
      ])
    } else if (typeof preprocessor === 'object') {
      loaders = loaders.concat([preprocessor])
    } else {
      throw new Error('invalid preprocessor')
    }
  }
  if (!isDev) {
    return [MiniCSSExtractPlugin.loader].concat(loaders.slice(1))
  }
  return loaders
}
