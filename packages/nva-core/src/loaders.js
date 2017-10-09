import path from 'path'
import { cssLoaders, postcssOptions, vueStyleLoaders } from './lib'

const nodeModulesDir = path.resolve('node_modules')

export default function (constants, strict) {
  const {
    FONT_OUTPUT,
    IMAGE_OUTPUT,
    IMAGE_PREFIX,
    FONT_PREFIX,
    DEV
  } = constants
  let urlLoaderOptions = {
    limit: 2500
  }
  if (!DEV) {
    urlLoaderOptions = {
      ...urlLoaderOptions,
      publicPath: function (url) {
        let prefix = ''
        if (/\.(jpg|png|bmp|gif)$/.test(url)) {
          prefix = IMAGE_PREFIX
        } else if (
          /\.(ttf|eot|svg|otf|woff(2)?)(\?v=[0-9]\.[0-9]\.[0-9])?$/.test(url)
        ) {
          prefix = FONT_PREFIX
        }
        return typeof prefix === 'function'
          ? prefix(url)
          : path.posix.join(prefix, path.basename(url))
      },
      hash: 'sha512',
      digest: 'hex',
      name: '[hash:8].[ext]'
    }
  }

  let imageLoaders = [
    {
      loader: require.resolve('url-loader'),
      options: DEV
        ? urlLoaderOptions
        : {
            ...urlLoaderOptions,
            outputPath: IMAGE_OUTPUT
          }
    }
  ]

  let vueLoaderOptions = {
    postcss: postcssOptions(constants).plugins(),
    loaders: {
      css: vueStyleLoaders(constants),
      less: vueStyleLoaders(constants, 'less'),
      stylus: vueStyleLoaders(constants, 'stylus'),
      scss: vueStyleLoaders(constants, {
        loader: 'sass-loader',
        options: { sourceMap: true }
      }),
      sass: vueStyleLoaders(constants, {
        loader: 'sass-loader',
        options: { indentedSyntax: true, sourceMap: true }
      })
    }
  }

  let loaders = [
    {
      test: /\.(tpl|html)/,
      exclude: [nodeModulesDir],
      loader: require.resolve('html-loader')
    },
    {
      test: /\.vue/,
      exclude: [nodeModulesDir],
      loader: 'vue-loader',
      options: vueLoaderOptions
    },
    {
      test: /\.(es6|js|jsx)$/,
      exclude: /node_modules/,
      // exclude: [nodeModulesDir],
      loader: require.resolve('happypack/loader'),
      options: { id: 'js' }
    },
    {
      test: /\.less/,
      exclude: [nodeModulesDir],
      use: cssLoaders(constants, 'less')
    },
    {
      test: /\.scss/,
      exclude: [nodeModulesDir],
      use: cssLoaders(constants, {
        loader: 'sass-loader',
        options: { sourceMap: true }
      })
    },
    {
      test: /\.styl/,
      exclude: [nodeModulesDir],
      use: cssLoaders(constants, 'stylus')
    },
    {
      test: /\.css/,
      use: cssLoaders(constants)
    },
    {
      test: /\.(png|jpg|gif|bmp)$/,
      exclude: [nodeModulesDir],
      use: imageLoaders
    },
    {
      test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
      loader: require.resolve('url-loader'),
      options: DEV
        ? urlLoaderOptions
        : {
            ...urlLoaderOptions,
            outputPath: FONT_OUTPUT,
            mimetype: 'application/font-woff'
          }
    },
    {
      test: /\.(ttf|eot|svg|otf)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
      loader: require.resolve('url-loader'),
      options: DEV
        ? urlLoaderOptions
        : {
            ...urlLoaderOptions,
            outputPath: FONT_OUTPUT
          }
    }
  ]

  if (strict) {
    loaders.unshift({
      test: /\.(js|jsx|vue)$/,
      exclude: /node_modules/,
      enforce: 'pre',
      loader: 'eslint-loader',
      options: {
        cache: true
      }
    })
  }
  return loaders
}
