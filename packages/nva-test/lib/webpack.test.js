const cssLoaders = [
  'vue-style-loader',
  require.resolve('css-loader'),
  require.resolve('resolve-url-loader')
]
const lessLoaders = cssLoaders.concat([
  { loader: require.resolve('less-loader'), options: { sourceMap: true } }
])
const sassLoaders = cssLoaders.concat([
  {
    loader: require.resolve('sass-loader'),
    options: { indentedSyntax: true, sourceMap: true }
  }
])
const scssLoaders = cssLoaders.concat([
  { loader: require.resolve('sass-loader'), options: { sourceMap: true } }
])
const stylusLoaders = cssLoaders.concat([
  { loader: require.resolve('stylus-loader'), options: { sourceMap: true } }
])

module.exports = ({ autowatch }) => {
  return {
    module: {
      rules: [
        {
          test: /\.(js|es6|jsx)$/,
          loader: 'babel-loader',
          exclude: /node_modules/
        },
        {
          test: /\.vue$/,
          loader: 'vue-loader',
          exclude: /node_modules/,
          // include: sourcePath,
          options: {
            loaders: {
              css: cssLoaders,
              less: lessLoaders,
              sass: sassLoaders,
              scss: scssLoaders,
              stylus: stylusLoaders
            }
          }
        },
        {
          test: /\.css$/,
          use: [require.resolve('style-loader'), require.resolve('css-loader')]
        },
        {
          test: /\.(gif|jpg|png|woff|svg|eot|ttf|otf)\??.*$/,
          loader: require.resolve('url-loader'),
          options: {
            limit: 1000
          }
        }
      ]
    },
    mode: 'production',
    devtool: '#eval',
    watch: autowatch
  }
}
