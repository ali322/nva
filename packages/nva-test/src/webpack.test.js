let { join, resolve } = require('path')

let cssLoaders = ['vue-style-loader', require.resolve('css-loader'), require.resolve('resolve-url-loader')]
let lessLoaders = cssLoaders.concat([{ loader: require.resolve('less-loader'), options: { sourceMap: true } }])
let sassLoaders = cssLoaders.concat([{ loader: require.resolve('sass-loader'), options: { indentedSyntax: true, sourceMap: true } }])
let scssLoaders = cssLoaders.concat([{ loader: require.resolve('sass-loader'), options: { sourceMap: true } }])
let stylusLoaders = cssLoaders.concat([{ loader: require.resolve('stylus-loader'), options: { sourceMap: true } }])

module.exports = {
    module: {
        rules: [{
                test: /\.(js|es6|jsx)/,
                loader: require.resolve('babel-loader'),
                exclude: [resolve('node_modules')]
            },
            {
                test: /\.(tpl|html)/,
                loader: require.resolve('html-loader'),
                exclude: [resolve('node_modules')],
            },
            {
                test: /\.vue/,
                loader: 'vue-loader',
                exclude: [resolve('node_modules')],
                options: {
                    loaders: {
                        css: cssLoaders,
                        less: lessLoaders,
                        sass: sassLoaders,
                        scss: scssLoaders,
                        stylus: stylusLoaders
                    }
                }
            }, {
                test: /\.(gif|jpg|png|woff|svg|eot|ttf|otf)\??.*$/,
                loader: require.resolve('url-loader'),
                options: {
                    limit: 1000
                }
            }
        ]
    },
    devtool: '#eval',
    watch: true
}