---
layout: default
title: NVA
---
[![NPM version][npm-version-image]][npm-url] [![NPM downloads][npm-downloads-image]][npm-url] [![Build Status][travis-image]][travis-url] [![MIT License][license-image]][license-url] [![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com)

[中文](./zh_cn/index.md)

## Install

Prerequisites: [Node.js](https://nodejs.org/en/) (>=4.x, LTS preferred), npm version 3+ and [Git](https://git-scm.com)
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
nva dev -p <port>
```
start develop server that [hot-module-replacement](http://webpack.github.io/docs/hot-module-replacement-with-webpack.html)(HMR) enabled,feel free get into your own business

3. build project

```bash
nva build
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

## Documentation

- [Setup](./setup.md)
- [Mock API](./mock.md)
- [Packages](./packages.md)

[license-image]: http://img.shields.io/badge/license-MIT-blue.svg?style=flat
[license-url]: http://en.wikipedia.org/wiki/MIT_License

[npm-url]: https://npmjs.org/package/nva
[npm-version-image]: http://img.shields.io/npm/v/nva.svg?style=flat
[npm-downloads-image]: http://img.shields.io/npm/dm/nva.svg?style=flat

[travis-url]: http://travis-ci.org/ali322/nva
[travis-image]: http://img.shields.io/travis/ali322/nva.svg?style=flat