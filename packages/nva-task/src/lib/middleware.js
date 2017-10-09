import webpack from 'webpack'
import webpackDevMiddleware from 'webpack-dev-middleware'
import webpackHotMiddleware from 'webpack-hot-middleware'

export default function (config, done, profile) {
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
