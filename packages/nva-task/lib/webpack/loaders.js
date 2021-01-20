const path = require('path')
// const threadLoader = require('thread-loader')
const assign = require('lodash/assign')
const {
  threadOptions,
  cssLoaders,
  postcssOptions,
  vueStyleLoaders
} = require('./util')

module.exports = (context, isWeb) => {
  const {
    output = {},
    imagePrefix,
    fontPrefix,
    isDev,
    strict,
    loaderOptions
  } = context

  const threadLoaderOptions = threadOptions(context)
  // threadLoader.warmup(threadLoaderOptions, [
  //   require.resolve('sass-loader')
  // ])

  let urlLoaderOptions = {
    limit: 2500
  }
  if (!isDev) {
    urlLoaderOptions = assign(
      {},
      urlLoaderOptions,
      {
        publicPath: function (url, resource) {
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
      }
    )
  }
  urlLoaderOptions = assign({}, urlLoaderOptions, loaderOptions.url || {})
  const vueLoaderOptions = {
    postcss: {
      plugins: postcssOptions(context).plugins,
      options: { sourceMap: 'inline' }
    },
    loaders: {
      js: [
        {
          loader: require.resolve('thread-loader'),
          options: threadLoaderOptions
        },
        {
          loader: 'babel-loader',
          options: { cacheDirectory: true }
        }
      ],
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
      test: /\.(js|jsx)$/,
      exclude: /node_modules/,
      use: [
        {
          loader: require.resolve('thread-loader'),
          options: threadLoaderOptions
        },
        {
          loader: 'babel-loader',
          options: Object.assign({}, {
            cacheDirectory: true
          }, loaderOptions.typescript)
        }
      ]
    },
    {
      test: /\.(ts|tsx)$/,
      exclude: /node_modules/,
      use: [
        {
          loader: require.resolve('thread-loader'),
          options: threadLoaderOptions
        },
        {
          loader: 'ts-loader',
          options: Object.assign({}, loaderOptions.typescript)
        }
      ]
    }
  ]

  if (isWeb) {
    loaders = loaders.concat([
      {
        test: /\.(tpl|html)$/,
        exclude: /node_modules/,
        loader: require.resolve('html-loader')
      },
      {
        test: /\.vue$/,
        exclude: /node_modules/,
        loader: 'vue-loader',
        options: loaderOptions.vue
          ? loaderOptions.vue.legacy
            ? vueLoaderOptions
            : loaderOptions.vue
          : {}
      },
      {
        test: /\.less$/,
        exclude: /node_modules/,
        use: cssLoaders(context, 'less')
      },
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        use: cssLoaders(context, 'sass')
      },
      {
        test: /\.sass$/,
        exclude: /node_modules/,
        use: cssLoaders(context, {
          loader: require.resolve('sass-loader'),
          options: { indentedSyntax: true, sourceMap: true }
        })
      },
      {
        test: /\.styl$/,
        exclude: /node_modules/,
        use: cssLoaders(context, 'stylus')
      },
      {
        test: /\.css$/,
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
    ])
  }

  if (strict) {
    loaders.unshift({
      test: /\.(js|jsx|ts|tsx|vue)$/,
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
