import HappyPack from 'happypack'
import os from 'os'
import autoPrefixer from 'autoprefixer'
import ExtractTextPlugin from 'extract-text-webpack-plugin'

export function happypackPlugin (id, loaders, tempDir) {
  const compilerThreadPool = HappyPack.ThreadPool({ size: os.cpus().length })
  return new HappyPack({
    id,
    tempDir,
    verbose: false,
    threadPool: compilerThreadPool,
    loaders
  })
}

export const postcssOptions = (context) => ({
  plugins: [autoPrefixer({browsers: ['last 2 versions']})],
  sourceMap: 'inline',
  ...(context.postcss || {})
})

export function vueStyleLoaders (context, preprocessor) {
  let loaders = cssLoaders({ ...context, isDev: true }, preprocessor)
  loaders = loaders.filter((v, i) => i > 0 && i !== 2)
  if (!context.isDev) {
    return ExtractTextPlugin.extract({
      use: loaders,
      fallback: 'vue-style-loader'
    })
  }
  return ['vue-style-loader'].concat(loaders)
}

export function cssLoaders (context, preprocessor = '') {
  let loaders = [
    { loader: require.resolve('style-loader') },
    { loader: require.resolve('css-loader'), options: { minimize: !context.isDev } },
    {
      loader: require.resolve('postcss-loader'),
      options: postcssOptions(context)
    },
    { loader: require.resolve('resolve-url-loader'), options: { debug: false } }
  ]
  if (preprocessor) {
    if (typeof preprocessor === 'string') {
      loaders = loaders.concat({
        loader: require.resolve(`${preprocessor}-loader`),
        options: { sourceMap: true }
      })
    } else if (typeof preprocessor === 'object') {
      loaders = loaders.concat({
        ...preprocessor,
        loader: require.resolve(preprocessor.loader)
      })
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
