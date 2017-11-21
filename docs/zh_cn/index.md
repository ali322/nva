---
layout: default
title: NVA
---
[![NPM version][npm-version-image]][npm-url] [![NPM downloads][npm-downloads-image]][npm-url] [![Build Status][travis-image]][travis-url] [![MIT License][license-image]][license-url] [![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com)

[English](../index.md)

## nva是什么?

nva是一个基于webpack,提供灵活配置的前端项目脚手架工具,既能支持纯前端项目(html+css+js)的开发需求,也能支持同构JS/SSR项目(node+react/node+vue)的开发,提供了多达8种不同的便捷项目模板,满足自动化开发,数据模拟,资源构建,模块管理,打包发布等等日常开发任务需求

## 安装

安装环境依赖: [Node.js](https://nodejs.org/en/) (>=4.x, LTS preferred), npm 3+ and [Git](https://git-scm.com)

```bash
npm install nva -g
```

使用镜像解决 node-sass 编译安装问题

```bash
npm i -g ipu-cli --sass-binary-site=http://npm.taobao.org/mirrors/node-sass/
```

## 快速开始

1. 初始化项目

```bash
nva init my-project
```

根据命令行提示填写,包含项目模板,框架,是否单页应用,版本号,描述信息,仓库地址,发布协议等等

2. 开始开发

```bash
cd my-project
nva dev -p 3000
```

使用 `nva dev` 启动开发服务器,启动完毕后会打开用户默认浏览器

3. 测试

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

## 项目模板

#### [纯前端模板](https://github.com/ali322/frontend-boilerplate)

  - react + redux 的多页面项目
  - react + redux + react-router 的单页面项目
  - vue + vuex 的多页面项目
  - vue + vuex + vue-router 的单页面项目
  
#### [同构JS模板](https://github.com/ali322/isomorphic-boilerplate)

  - react + redux + koa@2 的多页面项目
  - react + redux + react-router + koa@2 的单页面项目
  - vue + vuex + koa@2 的多页面项目
  - vue + vuex + vue-router + koa@2 的单页面项目

## 文档

- [配置](./setup.md)
- [模拟接口](./mock.md)
- [包](./packages.md)

[license-image]: http://img.shields.io/badge/license-MIT-blue.svg?style=flat
[license-url]: http://en.wikipedia.org/wiki/MIT_License

[npm-url]: https://npmjs.org/package/nva
[npm-version-image]: http://img.shields.io/npm/v/nva.svg?style=flat
[npm-downloads-image]: http://img.shields.io/npm/dm/nva.svg?style=flat

[travis-url]: http://travis-ci.org/ali322/nva
[travis-image]: http://img.shields.io/travis/ali322/nva.svg?style=flat