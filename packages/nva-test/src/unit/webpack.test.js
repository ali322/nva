let { join, resolve } = require('path')

module.exports = {
    module: {
        rules: [{
                test: /\.(js|es6)/,
                loader: 'babel-loader',
                include: [resolve('test/unit/spec'), resolve('test/unit/fixture'), resolve('src')]
            },
            {
                test: /\.(tpl|html)/,
                loader: 'html-loader'
            },
            {
                test: /\.vue/,
                loader: 'vue-loader'
            }
        ]
    },
    devtool: '#inline-source-map',
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
            "@": resolve("src/bundle")
        }
    }
}