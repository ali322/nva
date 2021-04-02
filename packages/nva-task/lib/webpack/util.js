const assign = require('lodash/assign')
const postcssPresetEnv = require('postcss-preset-env')
const isPlainObject = require('lodash/isPlainObject')
const MiniCSSExtractPlugin = require('mini-css-extract-plugin')

const mergeLoaderOptions = (defaults, options) => {
  return isPlainObject(options) ? assign({}, defaults, options) : defaults
}

exports.threadOptions = (context) => {
  const { loaderOptions } = context
  return mergeLoaderOptions(
    {
      workerParallelJobs: 50,
      poolRespawn: context.isDev,
      poolTimeout: 2000,
      poolParallelJobs: 50
    },
    loaderOptions.thread
  )
}

exports.postcssOptions = (context) => {
  const { loaderOptions } = context
  return mergeLoaderOptions(
    {
      plugins: [postcssPresetEnv({ stage: 4 })]
    },
    loaderOptions.postcss
  )
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
  const useVueStyleLoader = loaderOptions.vue && !loaderOptions.vue.legacy
  let loaders = [
    {
      loader: useVueStyleLoader
        ? 'vue-style-loader'
        : require.resolve('style-loader')
    },
    {
      loader: require.resolve('css-loader'),
      options: mergeLoaderOptions(loaderOptions.css)
    },
    {
      loader: require.resolve('postcss-loader'),
      options: {
        postcssOptions: exports.postcssOptions(context)
      }
    }
    // {
    //   loader: require.resolve('resolve-url-loader'),
    //   options: mergeLoaderOptions(
    //     { debug: true },
    //     loaderOptions.resolveURL
    //   )
    // }
  ]
  if (preprocessor) {
    if (typeof preprocessor === 'string') {
      loaders = loaders.concat([
        {
          loader: require.resolve(`${preprocessor}-loader`),
          options: mergeLoaderOptions(
            { sourceMap: true },
            loaderOptions[preprocessor]
          )
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
