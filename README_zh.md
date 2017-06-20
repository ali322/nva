# nva

简洁高效的前端项目脚手架, [英文文档](./README.md)

## nva是什么?

nva是一个基于webpack,提供灵活配置的前端项目脚手架工具,既能支持纯前端项目(html+css+js)的开发需求,也能支持同构JS/SSR项目(node+react/node+vue)的开发,提供了多达8种不同的便捷项目模板,满足自动化开发,数据模拟,资源构建,模块管理,打包发布等等日常开发任务需求

## 快速开始

安装环境依赖: [Node.js](https://nodejs.org/en/) (>=4.x, 6.x preferred), npm 3+ and [Git](https://git-scm.com)

第一步: 安装nva命令行工具

```bash
npm install nva -g
```

第二步: 初始化项目

```bash
nva init my-project
```

根据命令行提示填写,包含项目模板,框架,是否单页应用,版本号,描述信息,仓库地址,发布协议等等

第三步: 开始开发

```bash
cd my-project
nva dev -p 3000
```

使用 `nva dev` 启动开发服务器,启动完毕后会打开用户默认浏览器

第四步: 测试

```bash
nva test
```
根据不同的项目模板执行不同的单元测试

可选: 集成测试

```bash
npm i nva-test-e2e -g
nva-test-e2e -r path/ro/server.js -c path/to/config.js
```
基于nightwatch的集成测试,测试浏览器为 chrome

后续: 打包发布

```bash
nva build
```

完成源码的编译压缩,静态资源合并压缩,路径处理,html注入,构建版本号处理等等

## bundle 管理

- 增加 bundle

  添加一个空白 bundle
  
  ```bash
  nva bundle my-bundle
  ```
  
  以 other-bundle 为模板添加一个 bundle
  
  ```bash
  nva mod my-bundle -t other-bundle
  ```
  
  支持批量添加,多个模块名使用英文逗号 `,` 分隔

- 删除 bundle

  删除一个已有的 bundle
  
  ```bash
  nva bundle existed-bundle -d
  ```
  
  支持批量删除,多个模块名使用英文逗号 `,` 分隔

## 项目模板

- [纯前端模板](https://github.com/ali322/frontend-boilerplate)

  - react + redux 的多页面项目
  - react + redux + react-router 的单页面项目
  - vue + vuex 的多页面项目
  - vue + vuex + vue-router 的单页面项目
  
- [同构JS模板](https://github.com/ali322/isomorphic-boilerplate)

  - react + redux + koa@2 的多页面项目
  - react + redux + react-router + koa@2 的单页面项目
  - vue + vuex + koa@2 的多页面项目
  - vue + vuex + vue-router + koa@2 的单页面项目


## 配置参数

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

- `nva.json` 全局配置

    ```js
    {
        "type":"isomorphic",    /* 项目类型: `frontend`,`isomorphic`,`react-native` */
        "spa":true            /* 是否单页面项目(SPA)? */
        "jsExt":".jsx",    /* 入口 js 文件扩展名 */
        "cssExt":".styl",   /* 入口 css 文件扩展名 */
        "distFolder": "dist",   /* 源码编译目标目录名称 */
        "vendorFolder": "vendor",   /* 第三方依赖包编译目标目录名称 */
        "assetFolder": "asset",    /* 静态资源目录名称 */
        "fontFolder": "font",   /* 字体目录名称 */
        "imageFolder": "image",    /* 图片目录名称 */
        "sourcePath": "src",    /* 源码目录名称(仅限纯前端项目) */
        "bundleFolder": "bundle",   /* 客户端 bundle 目录(仅限同构JS项目) */
        "viewFolder": "view",    /* html 文件目录名称(仅限同构JS项目) */
        "bundleFolder": "bundle", /* 服务端 bundle 目录(仅限同构JS项目) */
        "serverFolder": "server",   /* 服务端源码目录(仅限同构JS项目) */
        "serverEntryJS": "bootstrap.js",    /* 服务端入口文件(仅限同构JS项目) */
    }
    ```
- `module.json` 项目模块配置

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

- `vendor.json` 第三方依赖包配置

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
    
- `mock` 模拟数据接口服务配置

    简单的模拟接口配置

    ```js
    module.exports = [{
        "url": "/mock/user",    /* 接口请求 url */
        "method": "get",        /* 接口请求方法名称 */
        "response": {           /* 接口响应 */
            "code": 200,
            "data": {
                "id": 6,
                "name": "Mr.smith"
            }
        }
    }]
    ```
    
    你也可以使用 [JSON Schema](http://json-schema.org) 一个更具语义化和持续化的模拟数据生成器来生成模拟数据

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

## 子包

packages 目录下的 `nva-core` `nva-task` `nva-server` `nva-test` `nva-test-e2e` 等子包可以独立安装使用

### nva-core

基础webpack编译配置,满足一般的构建需求

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

nva构建任务集合,可以根据需求自定义组合

```javascript
var tasks = require('nva-tasks')
tasks.frontend.build() //前端项目构建
task.isomorphic.build()  //同构JS项目构建
```
  
### nva-server

基于connect的前端开发服务,带模拟数据接口功能

```javascript
import App from 'nva-server'
let app = App()
app.listen(3000,()=>{
console.log('==> server stared at %d',3000)
})
```
  
也可以通过命令行方式调用,具体参数说明请参见 [nva-task](https://github.com/ali322/nva/blob/master/packages/nva-server/README.md)

```bash
nva-server -p 5000 -P src
```

### nva-test

基于 karma + mocha 的单元测试服务

运行测试

```bash
nva test
```

命令行参数

|     参数名      |  默认   |     描述     |
| :----------: | :----: | :----------: |
| -c or —-config |   无    |   测试配置    |

### nva-test-e2e

基于 nightwatch 的e2e测试服务

运行测试

```bash
nva test -r path/to/server.js -c path/to/config.js
```

命令行参数

|     参数名      |  默认   |     描述     |
| :----------: | :----: | :----------: |
| -c or —-config |   无    |    测试配置    |
| -r or —-runner |   无    |    应用测试服务器    |
| —-browser |   phantom.js    |    测试浏览器    |
    
## 代码规范校验

校验项目源码

```bash
npm run lint
```

## 待办

- 改进构建流程
- 提供更多的业务模板

## 贡献

欢迎 PR 和 issues,帮助 `nva` 更好

## 许可协议

[MIT License](http://en.wikipedia.org/wiki/MIT_License)