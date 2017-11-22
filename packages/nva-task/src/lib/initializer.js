import { omit, mapValues } from 'lodash'
import { join, posix, resolve, sep } from 'path'
import { initMod } from './mod'

function mixin (proj) {
  let {
    isSSR,
    output,
    distFolder,
    sourceFolder,
    vendorFolder,
    assetFolder,
    imageFolder,
    fontFolder
  } = proj
  return {
    imagePrefix: posix.join('..', assetFolder, imageFolder),
    fontPrefix: posix.join('..', assetFolder, fontFolder),
    output: {
      path: isSSR ? resolve(distFolder, sourceFolder) : resolve(distFolder),
      cssPath: join('[name]', '[name]-[hash:8].css'),
      imagePath: join(assetFolder, imageFolder, sep),
      fontPath: join(assetFolder, fontFolder, sep),
      vendorPath: isSSR
        ? join(distFolder, sourceFolder, vendorFolder)
        : join(distFolder, vendorFolder),
      ...output
    }
  }
}

export default function (context) {
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
    vendorSourceMap: 'sourcemap.json',

    staticFolder: 'static',
    assetFolder: 'asset',
    fontFolder: 'font',
    imageFolder: 'image',
    outputPrefix: '',

    hmrPath: '/hmr/',
    output: {}
  }

  if (isSSR) {
    projContext = {
      ...projContext,
      moduleFolder: 'module',
      bundleFolder: 'bundle',
      serverFolder: 'server',
      serverEntry: 'bootstrap.js',
      viewFolder: 'view',
      sourceFolder: 'client'
    }
  }

  projContext = {
    ...projContext,
    ...mixin(projContext),
    ...proj
  }

  let modsContext = mapValues(mods, (mod, name) => {
    return {
      ...mod,
      ...initMod(mod, name, projContext)
    }
  })

  return {
    ...omit(context, ['mods', 'proj']),
    mods: modsContext,
    ...projContext
  }
}
