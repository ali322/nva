nva [![Build Status](https://travis-ci.org/ali322/nva.svg?branch=master)](https://travis-ci.org/ali322/nva) [![Dependency Status](https://gemnasium.com/badges/github.com/ali322/nva.svg)](https://gemnasium.com/github.com/ali322/nva)
===
[![NPM](https://nodei.co/npm/nva.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/nva/)

yet another efficient and painless scaffold for frontend and isomorphic project [中文文档](./README_zh.md)


## Install

Prerequisites: [Node.js](https://nodejs.org/en/) (>=4.x, 6.x preferred), npm version 3+ and [Git](https://git-scm.com)
```javascript
npm install nva -g
```

## Quick Start

- generate project 

    ```bash
    nva init <project name>
    ```
    pull the template that you specified in question,generate project in `./<project name>`,you can also specified git repo to take place

    ```bash
    nva init <project name> -r [github repo]
    ```
    The shorthand repo notation is passed to download-git-repo so you can also use things like bitbucket:username/repo for a Bitbucket repo and username/repo#branch for tags or branches


- build project vendors

    ```bash
    nva vendor
    ```
    build project's third-party libraries

- start to develop

    ```bash
    nva dev
    nva dev -p <port>
    ```
    start develop server that [hot-module-replacement](http://webpack.github.io/docs/hot-module-replacement-with-webpack.html)(HMR) enabled,feel free get into your own business

- build project

    ```bash
    nva build
    ```
    build project to dist


## Manage Modules

- add module in project

    ```bash
    nva mod <module name, ...> #just simple module(s)
    nva mod <module name, ...> -t <copy from module>
    ```

- delete module in project

    ```bash
    nva mod <module name, ...> -d
    ```
 
## Other CLI

- list all available commands

    ```bash
    nva list
    ```

- show current version

    ```bash
    nva -v
    ```

## Supported Template

- [frontend boilerplate](https://github.com/ali322/frontend-boilerplate) 

  - multiple pages project with react + redux 
  - single page project with react + redux + react-router
  - multiple pages project with vue + vuex
  - single page project with vue + vuex + vue-router 

- [isomorphic boilerplate](https://github.com/ali322/isomorphic-boilerplate) with koa@2+react or koa@2+vue,server side render

  - multiple pages project with react + redux + koa@2
  - single page project with react + redux + react-router + koa@2
  - multiple pages project with vue + vuex + koa@2
  - single page project with vue + vuex + vue-router + koa@2

- react-native

  just simple [react-native boilerplate](https://github.com/ali322/react-native-boilerplate)

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
    |-- module.json # project module settings
    |-- vendor.json # project third-party libraries settings
```

- `nva.json` project global settings

    ```js
    {
        "type":"isomorphic",    /* project type of `frontend`,`isomorphic`,`react-native` */
        "spa":true            /* is an single page application(SPA)? */
        "jsExt":".jsx",    /* entry js file extension */
        "cssExt":".styl",   /* entry css file extension */
        "distFolder": "dist",   /* dist folder of build */
        "bundleFolder": "bundle",   /* all project module's parent folder */
        "vendorFolder": "vendor",   /* vendor folder of build */
        "assetFolder": "asset",    /* asset files folder */
        "fontFolder": "font",   /* icon font folder */
        "imageFolder": "image",    /* compressed image folder */
        "sourcePath": "src",    /* frontend project only, source code folder */
        "viewFolder": "view",    /* isomorphic project only,html files folder */
        "serverFolder": "server",   /* isomorphic project only, server side source code folder */
        "serverEntryJS": "bootstrap.js",    /* isomorphic project only,server entry file */
    }
    ```
- `module.json` project module settings

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

- `vendor.json` project vendors settings

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

- `mock` project mock server settings

    simple mock api setting

    ```js
    [{
        "url": "/mock/user",    /* mock api request url */
        "method": "get",        /* mock api request method */
        "response": {           /* mock api response */
            "code": 200,
            "data": {
                "id": 6,
                "name": "Mr.smith"
            }
        }
    }]
    ```
    you can also use [JSON Schema](http://json-schema.org) along with fake generators to provide consistent and meaningful fake data for your system

    ```json
    [{
        "url": "/mock/users",
        "method": "get",   
        "response": {        
            "type": "object",
            "properties": {
                "id": {
                    "$ref": "#/definitions/positiveInt"
                },
                "name": {
                    "type": "string",
                    "faker": "name.findName"
                },
            },
            "required": ["id", "name"],
            "definitions": {
                "positiveInt": {
                    "type": "integer",
                    "minimum": 0,
                    "exclusiveMinimum": true
                }
            }
        }
    },{
         "url": "/mock/user",
        "method": "post",
        "response": {
            "code": 200,
            "data": {
                "status": "ok"
            }
        }
    }]
    ```


## Test and Lint

lint your project source code

run lint

```bash
npm run lint
```
run test

```bash
npm run test
```

## Packages

`nva-core` `nva-task` `nva-server` `nva-test` `nva-test-e2e` in the packages directory can be install through npm independently

### nva-core

basic webpack config,you can extend like

```javascript
import config from 'nva-core'
const buildConfig = config(constants)
webpack({
...buildConfig,
entry:'index.js',
output:{
    ...
}
}).run((err,stats)=>{ ... })
```

### nva-task 

nva task collections,customize for your need

```javascript
var tasks = require('nva-tasks')
tasks.frontend.build() //frontend project build
task.isomorphic.build()  //isomorphic project build
```
  
### nva-server

development server base on connect

```javascript
import App from 'nva-server'
let app = App()
app.listen(3000,()=>{
console.log('==> server stared at %d',3000)
})
```

alsoo can run it in cli,more options refer to [nva-task](https://github.com/ali322/nva/blob/master/packages/nva-server/README.md)

```bash
nva-server -p 5000 -P src
```

### nva-test

frontend test toolkit based on karma + mocha

run test

```bash
nva test
```

cli options

|     param      |  default   |     description     |
| :----------: | :----: | :----------: |
| -c or —-config |   none    |    test config    |

### nva-test-e2e

frontend e2e test toolkit based on nightwatch

run test

```bash
nva test -r path/to/server.js -c path/to/config.js
```

cli options

|     param      |  default   |     description     |
| :----------: | :----: | :----------: |
| -c or —-config |   none    |    test config    |
| -r or —-runner |   none    |    app test server    |
| —-browser |   phantom.js    |    test on which browser    |

## Todo

- fix some unknow bugs
- add more template

## Contribution

welcome to pull request and issues,help to improve `nva` better 

## License

[MIT License](http://en.wikipedia.org/wiki/MIT_License)