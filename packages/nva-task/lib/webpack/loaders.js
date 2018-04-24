const path = require('path')
const assign = require('lodash/assign')
const { cssLoaders, postcssOptions, vueStyleLoaders } = require('./util')

module.exports = context => {
  const { output = {}, imagePrefix, fontPrefix, isDev, strict } = context

  let urlLoaderOptions = {
    limit: 2500
  }
  if (!isDev) {
    urlLoaderOptions = assign({}, urlLoaderOptions, {
      publicPath: function(url) {
        let prefix = ''
        if (/\.(jpg|jpeg|png|bmp|gif)$/.test(url)) {
          prefix = imagePrefix
        } else if (
          /\.(ttf|eot|svg|otf|woff(2)?)(\?v=[0-9]\.[0-9]\.[0-9])?$/.test(url)
        ) {
          prefix = fontPrefix
        }
        return typeof prefix === 'function'
          ? prefix(url)
          : path.posix.join(prefix, path.basename(url))
      },
      hash: 'sha512',
      digest: 'hex',
      name: '[hash:8].[ext]'
    })
  }

  const vueLoaderOptions = {
    postcss: {
      plugins: postcssOptions(context).plugins,
      options: { sourceMap: 'inline' }
    },
    loaders: {
      js: require.resolve('happypack/loader') + '?id=js',
      css: vueStyleLoaders(context),
      less: vueStyleLoaders(context, 'less'),
      stylus: vueStyleLoaders(context, 'stylus'),
      scss: vueStyleLoaders(context, {
        loader: 'sass-loader',
        options: { sourceMap: true }
      }),
      sass: vueStyleLoaders(context, {
        loader: 'sass-loader',
        options: { indentedSyntax: true, sourceMap: true }
      })
    }
  }

  let loaders = [
    {
      test: /\.(tpl|html)/,
      exclude: /node_modules/,
      loader: require.resolve('html-loader')
    },
    {
      test: /\.vue/,
      exclude: /node_modules/,
      loader: 'vue-loader',
      options: vueLoaderOptions
    },
    {
      test: /\.(es6|js|jsx)$/,
      exclude: /node_modules/,
      loader: require.resolve('happypack/loader'),
      options: { id: 'js' }
    },
    {
      test: /\.less/,
      exclude: /node_modules/,
      use: cssLoaders(context, 'less')
    },
    {
      test: /\.scss/,
      exclude: /node_modules/,
      use: cssLoaders(context, {
        loader: 'sass-loader',
        options: { sourceMap: true }
      })
    },
    {
      test: /\.styl/,
      exclude: /node_modules/,
      use: cssLoaders(context, 'stylus')
    },
    {
      test: /\.css/,
      use: cssLoaders(context)
    },
    {
      test: /\.(png|jpg|jpeg|gif|bmp)$/,
      loader: require.resolve('url-loader'),
      options: isDev
        ? urlLoaderOptions
        : assign({}, urlLoaderOptions, {
          outputPath: output.imagePath
        })
    },
    {
      test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
      loader: require.resolve('url-loader'),
      options: isDev
        ? urlLoaderOptions
        : assign({}, urlLoaderOptions, {
          outputPath: output.fontPath,
          mimetype: 'application/font-woff'
        })
    },
    {
      test: /\.(ttf|eot|svg|otf)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
      loader: require.resolve('url-loader'),
      options: isDev
        ? urlLoaderOptions
        : assign({}, urlLoaderOptions, {
          outputPath: output.fontPath
        })
    }
  ]

  if (strict) {
    loaders.unshift({
      test: /\.(js|jsx|vue)$/,
      exclude: /node_modules/,
      enforce: 'pre',
      loader: 'eslint-loader',
      options: {
        emitWarning: true
      }
    })
  }
  return loaders
}
