nva-core
===
[![NPM](https://nodei.co/npm/nva-core.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/nva-core/)

core task for nva-cli based on webpack

### Install


```javascript
npm install nva-core --save
```

### Usage


```javascript
import config from 'nva-core'

const buildConfig = config(context)
```

build context should contain followings

- `output.cssPath`      where to output css
- `output.fontPath`     where to output font
- `output.imagePath`    where to output image
- `imagePrefix`         prefix of image public path
- `fontPrefix`          prefix of font public path 
- `strict`              is strict mode?
- `isDev`               is in development mode?

### License

[MIT License](http://en.wikipedia.org/wiki/MIT_License)

