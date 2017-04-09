nva [![Build Status](https://travis-ci.org/ali322/nva.svg?branch=master)](https://travis-ci.org/ali322/nva) [![Dependency Status](https://gemnasium.com/badges/github.com/ali322/nva.svg)](https://gemnasium.com/github.com/ali322/nva)
===
[![NPM](https://nodei.co/npm/nva.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/nva/)

yet another efficient and painless scaffold for frontend and isomorphic project


### Install

Prerequisites: [Node.js](https://nodejs.org/en/) (>=4.x, 6.x preferred), npm version 3+ and [Git](https://git-scm.com)
```javascript
npm install nva -g
```

### Usage

- list all available commands

    ```bash
    nva list
    ```

- generate project 

    ```bash
    nva init <project name>
    ```
    pull the template that you specified in question,generate project in `./<project name>`,you can also specified git repo to take place

    ```bash
    nva init <project name> -r [github repo]
    ```
    The shorthand repo notation is passed to download-git-repo so you can also use things like bitbucket:username/repo for a Bitbucket repo and username/repo#branch for tags or branches

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
    build project with webpack

- build project vendors

    ```bash
    nva vendor
    ```
    build project's third-party libraries

- add module in project

    ```bash
    nva mod <module name, ...> #just simple module(s)
    nva mod <module name, ...> -t <copy from module>
    ```

- delete module in project

    ```bash
    nva mod <module name, ...> -d
    ```

### Supported Template

- frontend  

  just simple [frontend boilerplate](https://github.com/ali322/frontend-boilerplate)

- isomorphic

  [isomorphic boilerplate](https://github.com/ali322/isomorphic-boilerplate) with koa@2+react or koa@2+vue,server side render(SSR) enabled and single page application(SPA) also enabled

- react-native

  just simple [react-native boilerplate](https://github.com/ali322/react-native-boilerplate)

### Config

The purpose of nva is provide easy and painless way so that users can get started with actual app code as fast as possible,Howerver,nva need some configure to work in order
all config files alive in `.nva` directory of project

```bash
|-- .nva/
    |-- temp/   # build caching directory
    |-- api/   # mock server setting files
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
	    "integrated":true,    /* isomorphic project only,wether or not need start individual HMR server */
        "spa":true            /* is an single page application(SPA)? */
        "entryJSExt":".jsx",    /* entry js file extension */
        "entryCSSExt":".styl",   /* entry css file extension */
        "distFolder": "dist",   /* dist folder of build */
        "bundleFolder": "bundle",   /* all project module's parent folder */
        "vendorFolder": "vendor",   /* vendor folder of build */
        "assetFolder": "asset",    /* asset files folder */
        "spriteFolder": "sprites",    /* sprites background image folder */
        "fontFolder": "font",   /* icon font folder */
        "imageFolder": "image",    /* compressed image folder */
        "sourcePath": "src",    /* frontend project only, source code folder */
        "pagePath": "page",    /* html files folder */
        "serverFolder": "server",   /* isomorphic project only, server side source code folder */
        "serverEntryJS": "bootstrap.js",    /* isomorphic project only,server entry file */
        "clientPath": "client"    /* isomorphic project only,client side source code folder */
    }
    ```
- `module.json` project module settings

    ```js
    {
        "index": {  /* module name */
            "html": ["index.html"],     /* entry html file(s),nva will inject asset in these files */
            "path": "index",            /* relative path to `bundleFolder` */
            "vendor": {"js": "react","css": "common"}   /* module vendors,`react` and `common` reference to `vendor.json` */
        }
    }
    ```

- `vendor.json` project vendors settings

    ```js
    {
        "js":{
            "react":["react","react-dom"]     /* define js vendor */
        },
        "css":{
            "common":["font-awesome/css/font-awesome.css"]     /* define css vendor */
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


### Test and Lint

lint your project source code

```bash
npm run lint
```

project test with `ava` + `tap-spec`

```bash
npm run test
```

### Todo

- fix some unknow bugs
- add more template

### Contrib

welcome to pull request and issues,help to improve `nva` more powerful and better 

### License

[MIT License](http://en.wikipedia.org/wiki/MIT_License)