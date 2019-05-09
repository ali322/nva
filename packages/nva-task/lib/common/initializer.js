let omit = require('lodash/omit')
let mapValues = require('lodash/mapValues')
let { merge } = require('./helper')
let { join, posix, resolve, sep } = require('path')
let { initMod } = require('./mod')

function mixin(proj) {
  let {
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
    env: {},
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

    hmrPath: '/hmr/'
  }

  if (isSSR) {
    projContext = merge(projContext, {
      moduleFolder: 'module',
      bundleFolder: 'bundle',
      serverFolder: 'server',
      serverEntry: 'bootstrap.js',
      viewFolder: join('server', 'view'),
      sourceFolder: 'client'
    })
  }

  projContext = merge(projContext, proj)
  projContext = merge(mixin(projContext), projContext)

  let modsContext = mapValues(mods, (mod, name) => {
    return merge(mod, initMod(mod, name, projContext))
  })

  return merge(omit(context, ['mods', 'proj']), {
    mods: modsContext
  }, projContext)
}