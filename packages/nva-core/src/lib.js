import HappyPack from 'happypack'
import os from 'os'
import autoPrefixer from 'autoprefixer'
import sprites from 'postcss-sprites'

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

export const postcssOptions = ({HOT,SPRITE_OUTPUT})=>({
    plugins: function() {
        let plugins = [
            autoPrefixer()
        ]
        if (!HOT) {
            plugins.push(sprites({
                spritePath: SPRITE_OUTPUT
            }))
        }
        return plugins
    }
})

export function cssLoaders(constants, preprocessor = '', inline = true) {

    let cssLoaders = [
        { loader: 'style-loader' },
        { loader: 'css-loader', options: { minimize: !constants.HOT } },
        { loader: 'postcss-loader', options: postcssOptions(constants) },
        { loader: 'resolve-url-loader' }
    ]

    /* if inline mode,like in vue-loader */
    if (inline) {
        cssLoaders = cssLoaders.slice(0, -2).concat(cssLoaders.slice(-1))
    }
    if (preprocessor) {
        if (!inline && typeof preprocessor === 'string') {
            cssLoaders = [
                ...cssLoaders,
                { loader: 'happypack/loader', options: { id: preprocessor } }
            ]
        } else {
            cssLoaders = [
                ...cssLoaders,
                typeof preprocessor === 'string' ? `${preprocessor}-loader` : preprocessor
            ]
        }
    }
    return cssLoaders
}