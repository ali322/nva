---
layout: page
title: Packages
---

## Packages

`nva-core` `nva-task` `nva-server` `nva-test` `nva-test-e2e` in the packages directory can be install through npm independently

#### nva-core

initialize context for nva-cli

```javascript
import core from 'nva-core'

const context = core(options)
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
nva-server -p 5000 -c src
```

#### nva-test

frontend test toolkit based on karma + mocha

run test

```bash
nva-test
```
supported browsers: json, chrome, ie

cli options

|     param      |  default   |     description     |
| :----------: | :----: | :----------: |
| -c or —-config |   none    |    test config    |

config describle

```javascript
{
    entry: 'path/to/test-entry.js',
    reportPath: 'path/to/coverage',
    ...restOfKarmaConfig
}
```

#### nva-test-e2e

frontend e2e test toolkit

run test

```bash
nva-test-e2e -c path/to/config.js
```

cli options

|     param      |  default   |     description     |
| :----------: | :----: | :----------: |
| -c or —-config |   none    |    test config    |
| —-browser |  Chrome    |    test on which browser    |

config describle

```javascript
{
    spec: ['path/to/spec.js'],
    process: runner => runner.startApp('node path/to/server.js', 3000)
}
```

[Back to Index](./index.md)