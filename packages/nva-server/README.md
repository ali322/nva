nva-server
===
[![NPM](https://nodei.co/npm/nva-server.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/nva-server/)

frontend project development server

### Install


```javascript
npm install nva-server --save
```

### Usage


```bash
nva-server -p 5000 -c src
```

cli options

- `-v` or `--version` package version
- `-p` or `--port`  server listen port
- `-c` or `--content` serve content path
- `-a` or `--asset` serve asset path,if not set then content value by default
- `-m` or `--mock` mock api configs file path
- `-b` or `--browser` which browser to open
- `-i` or `--index` started url
- `--config` server config
- `--log`   enable log of request
- `--rewrites`  enable rewrites request to index.html
- `--cors` allows cross origin access serving

### License

[MIT License](http://en.wikipedia.org/wiki/MIT_License)