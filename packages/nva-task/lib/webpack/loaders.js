const path = require('path')
const assign = require('lodash/assign')
const { cssLoaders, postcssOptions, vueStyleLoaders } = require('./util')

module.exports = context => {
  const { output = {}, imagePrefix, fontPrefix, isDev, strict, loaderOptions } = context

  let urlLoaderOptions = {
    limit: 2500
  }
  if (!isDev) {
    urlLoaderOptions = assign({}, urlLoaderOptions, {
      publicPath: function(url, resource) {
        let prefix = ''
        if (/\.(jpg|jpeg|png|bmp|gif)$/.test(url)) {
          prefix = imagePrefix
        } else if (
          /\.(ttf|eot|svg|otf|woff(2)?)(\?v=[0-9]\.[0-9]\.[0-9])?$/.test(url)
        ) {
          prefix = fontPrefix
        }
        return typeof prefix === 'function'
          ? prefix(url, resource)
          : path.posix.join(prefix, path.basename(url))
      },
      hash: 'sha512',
      digest: 'hex',
      name: '[hash:8].[ext]'
    }, loaderOptions.url || {})
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
      stylus: vueStyleLoaders(context, {
        loader: require.resolve('stylus-loader'),
        options: { sourceMap: { comment: false } }
      }),
      scss: vueStyleLoaders(context, {
        loader: require.resolve('sass-loader'),
        options: { sourceMap: true }
      }),
      sass: vueStyleLoaders(context, {
        loader: require.resolve('sass-loader'),
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
      options: loaderOptions.vue ? (loaderOptions.vue.legacy ? vueLoaderOptions : loaderOptions.vue) : {}
    },
    {
      test: /\.(es6|js|jsx)$/,
      exclude: /node_modules/,
      loader: require.resolve('happypack/loader'),
      options: { id: 'js' }
    },
    {
      test: /\.(ts|tsx)$/,
      exclude: /node_modules/,
      loader: 'ts-loader',
      options: Object.assign({}, loaderOptions.typescript)
    },
    {
      test: /\.less/,
      exclude: /node_modules/,
      use: cssLoaders(context, 'less')
    },
    {
      test: /\.sass/,
      exclude: /node_modules/,
      use: cssLoaders(context, {
        loader: require.resolve('sass-loader'),
        options: { indentedSyntax: true, sourceMap: true }
      })
    },
    {
      test: /\.scss/,
      exclude: /node_modules/,
      use: cssLoaders(context, {
        loader: require.resolve('sass-loader'),
        options: { sourceMap: true }
      })
    },
    {
      test: /\.styl/,
      exclude: /node_modules/,
      use: cssLoaders(context, {
        loader: require.resolve('stylus-loader'),
        options: { sourceMap: { comment: false } }
      })
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
