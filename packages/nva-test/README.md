nva-test
===

frontend unit test toolkit

### Install


```javascript
npm install nva-test --save-dev
```

### Usage

- run e2e test

    ```bash
    nva-test -w
    ```

Supported browsers: jsom, chrome, ie

`babel-plugin-istanbul` should installed for coverage

```javascript
{
    "env": {
        "test": {
            "plugins": ["istanbul"]
        }
    }
}
```

### License

[MIT License](http://en.wikipedia.org/wiki/MIT_License)