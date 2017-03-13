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

const buildConfig = config(constants)
```

build constants should contain followings

- `HAPPYPACK_TEMP_DIR`  happypack compiler cache directory,by default `./.happpack`
- `ASSET_FONT_OUTPUT`   where to output font
- `ASSET_IMAGE_OUTPUT`  where to output image
- `SPRITE_OUTPUT`       where to output background sprite image
- `IMAGE_PREFIX`        prefix of image public path
- `FONT_PREFIX`         prefix of font public path 
- `HOT`                 is in development mode?

### License

[MIT License](http://en.wikipedia.org/wiki/MIT_License)

