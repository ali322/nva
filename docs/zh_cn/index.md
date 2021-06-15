---
layout: default
title: NVA
---
[![NPM version][npm-version-image]][npm-url] [![NPM downloads][npm-downloads-image]][npm-url] [![Build Status][circleci-image]][circleci-url] [![MIT License][license-image]][license-url] [![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com)

[English](../index.md)

## 介绍

nva是一个基于webpack,提供灵活配置的前端项目脚手架工具,既能支持纯前端项目(html+css+js)的开发需求,也能支持同构JS/SSR项目(node+react/node+vue)的开发

- 交互性方式初始化基于多种基础模板的项目
- 使用 js/json 定义满足项目需求的模拟数据
- 开箱即用的 Babel, Typescript, Sass, Less, Stylus 支持
- 支持单元测试和端到端测试

## 安装

安装环境依赖: [Node.js](https://nodejs.org/en/) (>=6.x, LTS preferred), npm 3+ and [Git](https://git-scm.com)

```bash
npm install nva -g
```

使用镜像解决 node-sass 编译安装问题

```bash
npm i -g nva --sass-binary-site=http://npm.taobao.org/mirrors/node-sass/
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
nva dev --client-port 8000 // 指定SSR前端端口
```

可使用 `silent` 参数跳过更新检测

```bash
nva dev --silent
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

4. 打包发布

```bash
nva build
```

可使用 `silent` 参数跳过更新检测

```bash
nva build --silent
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

## 更多命令

### nva mod

```bash
nva mod foo
// 或者基于已存在的模块复制一个新模块
nva mod foo -t bar
// 删除已存在的模块
nva mod foo -d
```

此操作会在源码路径下新增模块目录, 如果 `spa` 为 `false` 也会在 `bundle.json` 中增加构建入口

### nva gen

```bash
nva gen --input tpl/foo --output dist
```

渲染所有位于 `tpl/foo` 目录下的模板, 然后拷贝至 `dist` 目录, 模板变量定义文件 `tpl/foo/meta.js`, 所有模板位于 `tpl/foo/template` 目录

## 文档

- [配置](./setup.md)
- [模拟接口](./mock.md)
- [包](./packages.md)

[license-image]: https://img.shields.io/badge/license-MIT-blue.svg?style=flat
[license-url]: http://en.wikipedia.org/wiki/MIT_License

[npm-url]: https://npmjs.org/package/nva
[npm-version-image]: https://img.shields.io/npm/v/nva.svg?style=flat
[npm-downloads-image]: https://img.shields.io/npm/dm/nva.svg?style=flat

[circleci-url]: https://circleci.com/gh/ali322/nva
[circleci-image]: 	https://img.shields.io/circleci/project/github/ali322/nva.svg?style=flat