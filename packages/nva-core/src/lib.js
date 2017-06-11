import HappyPack from 'happypack'
import os from 'os'
import autoPrefixer from 'autoprefixer'
import ExtractTextPlugin from 'extract-text-webpack-plugin'

export function happypackPlugin(id, loaders, tempDir) {
    const compilerThreadPool = HappyPack.ThreadPool({ size: os.cpus().length })
    return new HappyPack({
        id,
        tempDir,
        verbose: false,
        threadPool: compilerThreadPool,
        loaders
    })
}

export const postcssOptions = ({ HOT, IMAGE_OUTPUT }) => ({
    plugins: function() {
        let plugins = [
            autoPrefixer()
        ]
        return plugins
    }
})

export function vueStyleLoaders(constants, preprocessor) {
    let { HOT = false } = constants
    let loaders = cssLoaders({ ...constants, HOT: true }, preprocessor)
    let _loaders = loaders.filter((v, i) => i === 1 || i > 2)
    if (!HOT) {
        return ExtractTextPlugin.extract({
            use: _loaders,
            fallback: 'vue-style-loader'
        })
    }
    return ['vue-style-loader'].concat(_loaders)
}

export function cssLoaders(constants, preprocessor = '') {
    let { HOT = false } = constants
    let loaders = [
        { loader: require.resolve('style-loader') },
        { loader: require.resolve('css-loader'), options: { minimize: !HOT } },
        { loader: require.resolve('postcss-loader'), options: postcssOptions(constants) },
        { loader: require.resolve('resolve-url-loader'), options: { debug: false } }
    ]
    if (preprocessor) {
        if (typeof preprocessor === 'string') {
            loaders = loaders.concat({ loader: require.resolve(`${preprocessor}-loader`), options: { sourceMap: true } })
        } else if (typeof preprocessor === 'object') {
            loaders = loaders.concat(preprocessor)
        } else {
            throw new Error('invalid preprocessor')
        }
    }
    if (!HOT) {
        return ExtractTextPlugin.extract({
            use: loaders.slice(1),
            fallback: loaders[0]
        })
    }
    return loaders
}