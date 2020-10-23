const omit = require('lodash/omit')
const mapValues = require('lodash/mapValues')
const { merge } = require('nva-util')
const { join, posix, resolve, sep } = require('path')
const { initMod } = require('./mod')

function mixin(proj) {
  const {
    isSSR,
    distFolder,
    sourceFolder,
    vendorFolder,
    vendorDevFolder,
    assetFolder,
    imageFolder,
    fontFolder
  } = proj
  return {
    imagePrefix: posix.join('..', assetFolder, imageFolder),
    fontPrefix: posix.join('..', assetFolder, fontFolder),
    output: {
      path: isSSR ? resolve(distFolder, sourceFolder) : resolve(distFolder),
      cssPath: join('[name]', '[name]-[contenthash].css'),
      imagePath: join(assetFolder, imageFolder, sep),
      fontPath: join(assetFolder, fontFolder, sep),
      vendorPath: isSSR
        ? join(distFolder, sourceFolder, vendorFolder)
        : join(distFolder, vendorFolder),
      vendorDevPath: isSSR
        ? join(distFolder, sourceFolder, vendorDevFolder)
        : join(distFolder, vendorDevFolder)
    }
  }
}

module.exports = context => {
  const { proj, mods } = context
  const isSSR = proj.type === 'isomorphic'

  let projContext = {
    isDev: false,
    strict: false,
    profile: false,
    isSSR,
    watch: [],
    sourceFolder: 'src',
    jsExt: '.js',
    cssExt: '.css',
    htmlExt: '.html',
    distFolder: 'dist',
    chunkFolder: 'chunk',
    vendorFolder: 'vendor',
    vendorDevFolder: 'vendor-dev',
    vendorSourceMap: 'sourcemap.json',

    staticFolder: 'static',
    staticPrefix: '',
    assetFolder: 'asset',
    fontFolder: 'font',
    imageFolder: 'image',
    outputPrefix: '',
    loaderOptions: {
      vue: {
        legacy: true
      }
    },

    hmrPath: '/hmr/'
  }

  if (isSSR) {
    projContext = merge(projContext, {
      bundleFolder: 'bundle',
      serverFolder: 'server',
      serverEntry: 'bootstrap.js',
      serverCompile: false,
      serverCompiler: 'babel-node',
      viewFolder: join('server', 'view'),
      sourceFolder: 'client'
    })
  }

  projContext = merge(projContext, proj)
  projContext = merge(mixin(projContext), projContext)

  let modsContext = mapValues(mods, (mod, name) => {
    return merge(mod, initMod(mod, name, projContext))
  })

  return merge(
    omit(context, ['mods', 'proj']),
    {
      mods: modsContext
    },
    projContext
  )
}
