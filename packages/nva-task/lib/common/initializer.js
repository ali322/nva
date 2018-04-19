const omit = require('lodash/omit')
const mapValues = require('lodash/mapValues')
const { merge } = require('./helper')
const { join, posix, resolve, sep } = require('path')
const { initMod } = require('./mod')

function mixin(proj) {
  const {
    isSSR,
    output,
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
    output: merge({
      path: isSSR
        ? resolve(distFolder, sourceFolder)
        : resolve(distFolder),
      cssPath: join('[name]', '[name]-[hash:8].css'),
      imagePath: join(assetFolder, imageFolder, sep),
      fontPath: join(assetFolder, fontFolder, sep),
      vendorPath: isSSR
        ? join(distFolder, sourceFolder, vendorFolder)
        : join(distFolder, vendorFolder),
      vendorDevPath: isSSR
        ? join(distFolder, sourceFolder, vendorDevFolder)
        : join(distFolder, vendorDevFolder)
    }, output)
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
    sourceFolder: 'src',
    jsExt: '.js',
    cssExt: '.css',
    htmlExt: '.html',
    buildFolder: 'build',
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

    hmrPath: '/hmr/',
    output: {}
  }

  if (isSSR) {
    projContext = merge(projContext, {
      moduleFolder: 'module',
      bundleFolder: 'bundle',
      serverFolder: 'server',
      serverEntry: 'app.js',
      serverCompile: false,
      serverCompileEntry: 'bootstrap.js',
      viewFolder: join('server', 'view'),
      sourceFolder: 'client',
      clientPort: 7000
    })
  }

  projContext = merge(projContext, mixin(projContext), proj)

  let modsContext = mapValues(mods, (mod, name) => {
    return merge(mod, initMod(mod, name, projContext))
  })

  return merge(omit(context, ['mods', 'proj']), {
    mods: modsContext
  }, projContext)
}