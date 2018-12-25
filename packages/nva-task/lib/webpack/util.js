const HappyPack = require('happypack')
const os = require('os')
const assign = require('lodash/assign')
const autoPrefixer = require('autoprefixer')
const MiniCSSExtractPlugin = require('mini-css-extract-plugin')

const compilerThreadPool = HappyPack.ThreadPool({ size: os.cpus().length })

exports.happypackPlugin = (id, loaders) => {
  return new HappyPack({
    id,
    verbose: false,
    threadPool: compilerThreadPool,
    loaders
  })
}

exports.postcssOptions = context => {
  return assign(
    {},
    {
      plugins: [autoPrefixer()],
      sourceMap: 'inline'
    },
    context.postcss || {}
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
  let loaders = [
    { loader: require.resolve('style-loader') },
    {
      loader: require.resolve('css-loader'),
      options: { minimize: !context.isDev }
    },
    {
      loader: require.resolve('postcss-loader'),
      options: exports.postcssOptions(context)
    },
    { loader: require.resolve('resolve-url-loader'), options: { debug: false } }
  ]
  if (preprocessor) {
    if (typeof preprocessor === 'string') {
      loaders = loaders.concat([
        {
          loader: require.resolve(`${preprocessor}-loader`),
          options: { sourceMap: true }
        }
      ])
    } else if (typeof preprocessor === 'object') {
      loaders = loaders.concat([preprocessor])
    } else {
      throw new Error('invalid preprocessor')
    }
  }
  if (!context.isDev) {
    return [MiniCSSExtractPlugin.loader].concat(loaders.slice(1))
  }
  return loaders
}
