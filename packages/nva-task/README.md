nva-task 
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
tasks.frontend.build()
task.isomorphic.build()
```

### API

### frontend

    - developServer: start develop server with browser-sync and hot module replacement(HMR) if using react stuff
    - build: compile source code,inject to htmls
    - vendor: compile third-party libraries
    - addModule: create project module(s)
    - removeModule: delete project module(s)

### isomorphic

    - developServer: start develop server for nodeJS app with browser-sync
    - build: compile source code,inject to nodeJS app's templates
    - vendor: compile third-party libraries
    - addModule: create project module(s)
    - removeModule: delete project module(s)

### Todo

- fix some unknow bugs


### License

[MIT License](http://en.wikipedia.org/wiki/MIT_License)