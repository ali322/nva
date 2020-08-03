const webpack = require('webpack')
const webpackDevMiddleware = require('webpack-dev-middleware')
const webpackHotMiddleware = require('webpack-hot-middleware')

module.exports = (config, done, silent) => {
  const bundler = webpack(config)
  if (bundler.hooks) {
    bundler.hooks.done.tap('nva-dev', stats => done(null, stats))
    bundler.hooks.failed.tap('nva-dev', err => done(err, null))
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
      logLevel: silent ? 'info' : 'silent',
      lazy: false,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      watchOptions: {
        aggregateTimeout: 300,
        poll: true,
        ignored: [/node_modules/]
      }
    }),
    webpackHotMiddleware(bundler, {
      path: `/__webpack_hmr_${config.name}`,
      log: false
    })
  ]
}
