nva-task [![Dependency Status](https://gemnasium.com/badges/github.com/ali322/nva-task.svg)](https://gemnasium.com/github.com/ali322/nva-task)
===
[![NPM](https://nodei.co/npm/nva-task.png)](https://nodei.co/npm/nva-task/)

tasks for nva cli,make frontend develop more efficiency

### Install

```javascript
npm install nva-task --save
```

### Usage

```javascript
var tasks = require('nva-tasks')
tasks.frontend.release()
task.isomorphic.release()
```

### API

### frontend

    - developServer: start develop server with browser-sync and hot module replacement(HMR) if using react stuff
    - release: compile source code,inject to htmls

### isomorphic

    - developServer: start develop server for nodeJS app with browser-sync
    - hmrServer: start frontend develop server with hot module replacement(HMR) if using react stuff
    - release: compile source code,inject to nodeJS app's templates

### Todo

- fix some unknow bugs


### License

[MIT License](http://en.wikipedia.org/wiki/MIT_License)