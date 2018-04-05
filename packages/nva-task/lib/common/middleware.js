let webpack = require('webpack')
let webpackDevMiddleware = require('webpack-dev-middleware')
let webpackHotMiddleware = require('webpack-hot-middleware')

module.exports = (config, done, profile) => {
  let bundler = webpack(config)
  if (bundler.hooks) {
    bundler.hooks.done.tap('NvaDev', stats => done(null, stats))
    bundler.hooks.failed.tap('NvaDev', err => done(err, null))
  } else {
    bundler.plugin('done', stats => done(null, stats))
    bundler.plugin('failed', err => done(err, null))
  }
  return [
    webpackDevMiddleware(bundler, {
      publicPath: config.output.publicPath,
      stats: {
        colors: true
      },
      hot: true,
      logLevel: profile ? 'info' : 'silent',
      lazy: false,
      watchOptions: {
        aggregateTimeout: 300,
        poll: true,
        ignored: [/node_modules/]
      }
    }),
    webpackHotMiddleware(bundler, { log: false })
  ]
}
