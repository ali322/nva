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

export const postcssOptions = () => ({
  plugins: function () {
    let plugins = [autoPrefixer()]
    return plugins
  }
})

export function vueStyleLoaders (constants, preprocessor) {
  let loaders = cssLoaders({ ...constants, DEV: true }, preprocessor)
  loaders = loaders.filter((v, i) => i > 0 && i !== 2)
  if (!constants.DEV) {
    return ExtractTextPlugin.extract({
      use: loaders,
      fallback: 'vue-style-loader'
    })
  }
  return ['vue-style-loader'].concat(loaders)
}

export function cssLoaders (constants, preprocessor = '') {
  let loaders = [
    { loader: require.resolve('style-loader') },
    { loader: require.resolve('css-loader'), options: { minimize: !constants.DEV } },
    {
      loader: require.resolve('postcss-loader'),
      options: postcssOptions(constants)
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
  if (!constants.DEV) {
    return ExtractTextPlugin.extract({
      use: loaders.slice(1),
      fallback: loaders[0]
    })
  }
  return loaders
}
