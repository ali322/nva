---
layout: page
title: Packages
---

## 包

packages 目录下的 `nva-core` `nva-task` `nva-server` `nva-test` `nva-test-e2e` 等子包可以独立安装使用

#### nva-core

根据选项初始化 `nva` 的上下文

```javascript
import core from 'nva-core'

const context = core(options)
```
  
#### nva-task

nva构建任务集合,可以根据需求自定义组合

```javascript
var tasks = require('nva-tasks')
tasks.frontend.build() //前端项目构建
task.isomorphic.build()  //同构JS项目构建
```
  
#### nva-server

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
nva-server -p 5000 -c src
```

#### nva-test

基于 karma + webpack + mocha 的单元测试服务

运行测试

```bash
nva-test
```

支持的浏览器测试环境: jsdom, chrome, ie

命令行参数

|     参数名      |  默认   |     描述     |
| :----------: | :----: | :----------: |
| -c or —-config |   无    |   测试配置    |

配置描述

```javascript
{
    entry: 'path/to/test-entry.js',
    reportPath: 'path/to/coverage',
    ...restOfKarmaConfig
}
```

#### nva-test-e2e

端到端测试服务

运行测试

```bash
nva-test-e2e -c path/to/config.js
```

命令行参数

|     参数名      |  默认   |     描述     |
| :----------: | :----: | :----------: |
| -c or —-config |   无    |    测试配置    |
| —-browser |   Chrome    |    测试浏览器    |

配置文件描述

```javascript
{
    spec: ['path/to/spec.js'],
    process: runner => runner.startApp('node path/to/server.js', 3000)
}
```

[返回首页](./index.md)