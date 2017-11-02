---
layout: page
title: Packages
---

`nva-core` `nva-task` `nva-server` `nva-test` `nva-test-e2e` in the packages directory can be install through npm independently

#### nva-core

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

#### nva-task 

nva task collections,customize for your need

```javascript
var tasks = require('nva-tasks')
tasks.frontend.build() //frontend project build
task.isomorphic.build()  //isomorphic project build
```
  
#### nva-server

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

#### nva-test

frontend test toolkit based on karma + mocha

run test

```bash
nva test
```

cli options

|     param      |  default   |     description     |
| :----------: | :----: | :----------: |
| -c or —-config |   none    |    test config    |

#### nva-test-e2e

frontend e2e test toolkit based on nightwatch

run test

```bash
nva test -r path/to/server.js -c path/to/config.js
```

cli options

|     param      |  default   |     description     |
| :----------: | :----: | :----------: |
| -c or —-config |   none    |    test config    |
| -s or —-server |   none    |    app test server    |
| —-browser |   phantom.js    |    test on which browser    |