let HappyPack = require('happypack')
let os = require('os')
let assign = require('lodash/assign')
let autoPrefixer = require('autoprefixer')
let ExtractTextPlugin = require('extract-text-webpack-plugin')

exports.happypackPlugin = (id, loaders) => {
  const compilerThreadPool = HappyPack.ThreadPool({ size: os.cpus().length })
  return new HappyPack({
    id,
    verbose: false,
    threadPool: compilerThreadPool,
    loaders
  })
}

exports.postcssOptions = context => {
  return assign({}, {
    plugins: [autoPrefixer({ browsers: ['last 2 versions'] })],
    sourceMap: 'inline',
  }, context.postcss || {})
}

exports.vueStyleLoaders = (context, preprocessor) => {
  let loaders = exports.cssLoaders(assign({}, context, { isDev: true }), preprocessor)
  loaders = loaders.filter((v, i) => i > 0 && i !== 2)
  if (!context.isDev) {
    return ExtractTextPlugin.extract({
      use: loaders,
      fallback: 'vue-style-loader'
    })
  }
  return ['vue-style-loader'].concat(loaders)
}

exports.cssLoaders = (context, preprocessor = '') => {
  let loaders = [
    { loader: require.resolve('style-loader') },
    { loader: require.resolve('css-loader'), options: { minimize: !context.isDev } },
    {
      loader: require.resolve('postcss-loader'),
      options: exports.postcssOptions(context)
    },
    { loader: require.resolve('resolve-url-loader'), options: { debug: false } }
  ]
  if (preprocessor) {
    if (typeof preprocessor === 'string') {
      loaders = loaders.concat([{
        loader: require.resolve(`${preprocessor}-loader`),
        options: { sourceMap: true }
      }])
    } else if (typeof preprocessor === 'object') {
      loaders = loaders.concat([assign({}, preprocessor, {
        loader: require.resolve(preprocessor.loader)
      })])
    } else {
      throw new Error('invalid preprocessor')
    }
  }
  if (!context.isDev) {
    return ExtractTextPlugin.extract({
      use: loaders.slice(1),
      fallback: loaders[0]
    })
  }
  return loaders
}