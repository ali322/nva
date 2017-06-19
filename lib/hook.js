const alias = {
    resolve: {
        alias: {
            'vue': 'vue/dist/vue.esm.js',
            "vue-router": 'vue-router/dist/vue-router.esm.js'
        }
    }
}

module.exports = {
    beforeDev(config) {
        return alias
    },
    beforeBuild(config) {
        return alias
    },
    beforeVendor(config) {
        return config.map(v => {
            return v.name === 'js' ? alias : null
        })
    }
}