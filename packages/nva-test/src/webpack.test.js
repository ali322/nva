let { join, resolve } = require('path')

let cssLoaders = ['vue-style-loader', 'css-loader', 'resolve-url-loader']
let lessLoaders = cssLoaders.concat([{ loader: 'less-loader', options: { sourceMap: true } }])
let sassLoaders = cssLoaders.concat([{ loader: 'sass-loader', options: { indentedSyntax: true, sourceMap: true } }])
let scssLoaders = cssLoaders.concat([{ loader: 'sass-loader', options: { sourceMap: true } }])
let stylusLoaders = cssLoaders.concat([{ loader: 'stylus-loader', options: { sourceMap: true } }])

module.exports = {
    module: {
        rules: [{
                test: /\.(js|es6|jsx)/,
                loader: 'babel-loader',
                include: [resolve('test', 'unit', 'spec'),
                    resolve('test', 'unit', 'fixture'),
                    resolve('src')
                ]
            },
            {
                test: /\.(tpl|html)/,
                loader: 'html-loader',
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
            }
        ]
    },
    devtool: '#eval-source-map',
    watch: true,
    context: __dirname,
    resolveLoader: {
        modules: [resolve('node_modules'), 'node_modules']
    },
    resolve: {
        extensions: ['.js', '.json', '.vue'],
        alias: {
            vue: "vue/dist/vue.esm.js",
            vuex: "vuex/dist/vuex.esm.js",
            "vue-router": "vue-router/dist/vue-router.esm.js",
            "@": resolve("src", "bundle")
        }
    }
}