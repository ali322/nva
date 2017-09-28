import { omit, mapValues } from "lodash"
import { join } from "path"
import { initMod } from "./mod"

export default function (context) {
  const { proj, mods, namespace } = context
  const isIsomorphic = proj.type === "isomorphic"

  let _proj = {
    sourceFolder: "src",
    jsExt: ".js",
    cssExt: ".css",
    htmlExt: ".html",
    buildFolder: "build",
    distFolder: "dist",
    chunkFolder: "chunk",
    vendorFolder: "vendor",
    vendorSourceMap: "sourcemap.json",

    staticFolder: "static",
    assetFolder: "asset",
    fontFolder: "font",
    imageFolder: "image",
    fontPrefix: "",
    imagePrefix: "",

    hmrPath: "/hmr/",
    cachePath: join(`.${namespace}`, "temp", "happypack")
  }

  if (isIsomorphic) {
    _proj = {
      ..._proj,
      moduleFolder: "module",
      bundleFolder: "bundle",
      serverFolder: "server",
      serverEntry: "bootstrap.js",
      viewFolder: "view",
      sourceFolder: "client"
    }
  }

  _proj = { ..._proj, ...proj }

  let _mods = mapValues(mods, (mod, name) => {
    return {
      ...mod,
      ...initMod(mod, name, _proj)
    }
  })

  return {
    ...omit(context, ["mods", "proj"]),
    mods: _mods,
    ..._proj
  }
}
