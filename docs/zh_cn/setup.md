---
layout: page
title: Setup
---

## 配置

nva提供尽量简洁高效的方式进行前端项目开发,所以大部分时候使用默认配置即可,但是为了满足不同的业务场景,也提供了灵活的配置入口方便自定义,配置文件都位于项目的 .nva 目录下

.nva 目录结构如下

```bash
|-- .nva/
    |-- temp/   # 编译缓存目录
    |-- mock/   # 模拟数据接口服务配置
        |-- user.json  # 模拟用户数据接口配置
        |-- ...
    |-- nva.json    # 全局配置
    |-- bundle.json # 项目 bundle 设置
    |-- vendor.json # 项目第三方包依赖设置
```

#### `nva.js` 全局配置

```js
{
    "type":"isomorphic",    /* 项目类型: `frontend`,`isomorphic` */
    "strict":false,          /* 是否开启 linter */
    "profile":false,      /* 是否在webpack打包时开启 profile 分析 */
    "jsExt":".jsx",    /* 入口 js 文件扩展名 */
    "cssExt":".styl",   /* 入口 css 文件扩展名 */
    "distFolder": "dist",   /* 源码编译目标目录名称 */
    "chunkFolder": "chunk",   /* 动态包目录名称 */
    "vendorFolder": "vendor",   /* 第三方依赖包编译目标目录名称(生产) */
    "vendorDevFolder": "vendor-dev",   /* 第三方依赖包编译目标目录名称(开发) */
    "vendorSourceMap": "sourcemap.json" /* 第三方依赖包编译后的清单 */
    "assetFolder": "asset",    /* 静态资源目录名称 */
    "fontFolder": "font",   /* 字体目录名称 */
    "imageFolder": "image",    /* 图片目录名称 */
    "staticFolder": "static",   /* 静态资源目录名称 */
    "staticPrefix": "",     /* 静态资源引用路径前缀 */
    "loaderOptions": {vue: {legacy: true}}, /* webpack loader 的配置 */
    "sourcePath": "src",    /* 源码目录名称(仅限纯前端项目) */
    "bundleFolder": "bundle",   /* 客户端 bundle 目录(仅限同构JS项目) */
    "viewFolder": "view",    /* html 文件目录名称(仅限同构JS项目) */
    "bundleFolder": "bundle", /* 服务端 bundle 目录(仅限同构JS项目) */
    "serverFolder": "server",   /* 服务端源码目录(仅限同构JS项目) */
    "serverEntry" : "bootstrap.js" /* 服务端入口文件(仅限同构JS项目) */
    "serverCompile": false /* 是否编译服务端代码(仅限同构JS项目) */
    "clientPort": 7000 /* 客户端开发服务监听端口(仅限同构JS项目) */
}
```
#### `module.json` 项目模块配置

```js
{
    "index": {  /* 模块名称 */
        "input":{
            "js":"index.js",    /* 入口 js 文件 */
            "css":"index.css",  /* 入口 css 文件 */
            "html":"index.html"   /* 入口 html 文件 */
        },
        "vendor": {"js": "base","css": "base"}   /* 模块依赖引用名称,引用自 `vendor.json` */
    }
}
```

`vendor.js` 也接受一个引用数组

#### `vendor.json` 第三方依赖包配置

```js
{
    "js":{
        "base":["react","react-dom"]     /* 定义一个JS依赖引用 */
    },
    "css":{
        "base":["font-awesome/css/font-awesome.css"]     /* 定义一个css依赖引用 */
    }
}
```

[返回首页](./index.md)