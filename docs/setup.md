---
layout: page
title: Setup
---

## Config

The purpose of nva is provide easy and painless way so that users can get started with actual app code as fast as possible,Howerver,nva need some configure to work in order
all config files alive in `.nva` directory of project

```bash
|-- .nva/
    |-- temp/   # build caching directory
    |-- mock/   # mock server setting files
        |-- user.json  # mock user api setting
        |-- ...
    |-- nva.json    # global settings
    |-- bundle.json # project module settings
    |-- vendor.json # project third-party libraries settings

#### `nva.js` project global settings

```js
{
    "type":"isomorphic",    /* project type of `frontend`,`isomorphic`,`react-native` */
    "spa":true            /* is an single page application(SPA)? */
    "jsExt":".jsx",    /* entry js file extension */
    "cssExt":".styl",   /* entry css file extension */
    "distFolder": "dist",   /* dist folder of build */
    "vendorFolder": "vendor",   /* vendor folder of build */
    "assetFolder": "asset",    /* asset files folder */
    "fontFolder": "font",   /* icon font folder */
    "imageFolder": "image",    /* compressed image folder */
    "sourcePath": "src",    /* frontend project only, source code folder */
    "bundleFolder": "bundle",   /* isomorphic project only, client side bundle folder */
    "viewFolder": "view",    /* isomorphic project only,html files folder */
    "serverFolder": "server",   /* isomorphic project only, server side source code folder */
    "serverEntryJS": "bootstrap.js",    /* isomorphic project only,server entry file */
}
```
#### `bundle.json` project module settings

```js
{
    "index": {  /* module name */
        "input":{
            "js":"index.js",    /* entry js file */
            "css":"index.css",  /* entry css file */
            "html":"index.html"   /* entry html file */
        },
        "vendor": {"js": "base","css": "base"}   /* module vendors,`js.base` and `css.base` reference to `vendor.json` */
    }
}
```

you can add or remove bundles using cli of `nav bundle`, split bundle name with `,`

add bundles

```bash
nva bundle <bundle name, ...> #just simple bundle(s)
nva bundle <bundle name, ...> -t <copy from bundle>
```

#### delete bundle in project

```bash
nva mod <bundle name, ...> -d
```

#### `vendor.json` project vendors settings

```js
{
    "js":{
        "base":["react","react-dom"]     /* define js vendor */
    },
    "css":{
        "base":["font-awesome/css/font-awesome.css"]     /* define css vendor */
    }
}
```

[Back to Index](./index.md)