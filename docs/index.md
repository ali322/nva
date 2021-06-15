---
layout: default
title: NVA
---
[![NPM version][npm-version-image]][npm-url] [![NPM downloads][npm-downloads-image]][npm-url] [![Build Status][circleci-image]][circleci-url] [![MIT License][license-image]][license-url] [![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com)

[中文](./zh_cn/index.md)

## Introduction

nva is scaffold toolset which offer flexible configuration base on webpack,it support development purely frontend project(html+css+js) and isomorphic project(node+react/vue)

- interactive project scaffolding in many kinds of fundamental project template
- define mock data in js or json to satisfy requirements 
- out-of-box support Babel, Typescript, Sass, Less, Stylus
- built-in support unit test and end-to-end test

you can also find Desktop Application named [NVA Client](https://github.com/ali322/nva-client)

## Install

Prerequisites: [Node.js](https://nodejs.org/en/) (>=6.x, LTS preferred), npm version 3+ and [Git](https://git-scm.com)
```javascript
npm install nva -g
```

## Quick Start

1. generate project 

```bash
nva init <project name>
```

pull the template that you specified in question,generate project in `./<project name>`,you can also specified git repo to take place

```bash
nva init <project name> -r [github repo]
```

The shorthand repo notation is passed to download-git-repo so you can also use things like bitbucket:username/repo for a Bitbucket repo and username/repo#branch for tags or branches


2. start to develop

```bash
nva dev
nva dev --silent // ignore update checks
nva dev -p <port>
nva dev --client-port <client port> // specified client port for ssr project
```
start develop server that [hot-module-replacement](http://webpack.github.io/docs/hot-module-replacement-with-webpack.html)(HMR) enabled,feel free get into your own business


3. build project

```bash
nva build
nva build --silent // ignore update checks
```

build project to dist,prepare for deploy

## Supported Template

#### [frontend boilerplate](https://github.com/ali322/frontend-boilerplate) 

- multiple pages project with react + redux 
- single page project with react + redux + react-router
- multiple pages project with vue + vuex
- single page project with vue + vuex + vue-router 

#### [isomorphic boilerplate](https://github.com/ali322/isomorphic-boilerplate)

koa@2+react or koa@2+vue,server side render

- multiple pages project with react + redux + koa@2
- single page project with react + redux + react-router + koa@2
- multiple pages project with vue + vuex + koa@2
- single page project with vue + vuex + vue-router + koa@2

## More Cli

### nva mod

```bash
nva mod foo
// or add mod which copied from existed module
nva mod foo -t bar
// delete existed module
nva mod foo -d
```

add module directory in source path, if `spa` is `false` it will add build entry in `bundle.json`

### nva gen

```bash
nva gen --input tpl/foo --output dist
```

render all templates in `tpl/foo` and output files in `dist`, `tpl/foo` directory should contain `meta.js` which defined some template variables and all templates live in `tpl/foo/template`


## Documentation

- [Setup](./setup.md)
- [Mock API](./mock.md)
- [Packages](./packages.md)

[license-image]: https://img.shields.io/badge/license-MIT-blue.svg?style=flat
[license-url]: http://en.wikipedia.org/wiki/MIT_License

[npm-url]: https://npmjs.org/package/nva
[npm-version-image]: https://img.shields.io/npm/v/nva.svg?style=flat
[npm-downloads-image]: https://img.shields.io/npm/dm/nva.svg?style=flat

[circleci-url]: https://circleci.com/gh/ali322/nva
[circleci-image]: 	https://img.shields.io/circleci/project/github/ali322/nva.svg?style=flat