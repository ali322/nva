let webpack = require('webpack')
let webpackDevMiddleware = require('webpack-dev-middleware')
let webpackHotMiddleware = require('webpack-hot-middleware')

module.exports = (config, done, profile) => {
  let bundler = webpack(config)
  bundler.plugin('done', done)
  return [
    webpackDevMiddleware(bundler, {
      publicPath: config.output.publicPath,
      stats: {
        colors: true
      },
      hot: true,
      noInfo: !profile,
      lazy: false,
      watchOptions: {
        aggregateTimeout: 300,
        poll: true,
        ignored: [/node_modules/]
      },
      quiet: !profile
    }),
    webpackHotMiddleware(bundler, { log: false })
  ]
}