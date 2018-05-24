---
layout: page
title: Mock
---

## 模拟接口

模拟接口配置文件位于 `.nva/mock`, 支持 `.json`, `.js` 后缀的配置文件


```js
module.exports = [{
    "url": "/mock/user",    /* 请求 url */
    "method": "get",        /* 请求方法 */
    "response": {           /* 响应 */
        "code": 200,        /* 响应状态码 */
        "data": {           /* 响应结果 */
            "id": 6,
            "name": "Mr.smith"
        }
    }
}]
```
    
也可以使用 [JSON Schema](http://json-schema.org) 一个更具语义化和持续化的模拟数据生成器来生成模拟数据

```json
[{
    "url": "/mock/users",
    "method": "get",   
    "response": {        
        "type": "object",
        "properties": {
            "id": {
                "$ref": "#/definitions/positiveInt"
            },
            "name": {
                "type": "string",
                "faker": "name.findName"
            },
        },
        "required": ["id", "name"],
        "definitions": {
            "positiveInt": {
                "type": "integer",
                "minimum": 0,
                "exclusiveMinimum": true
            }
        }
    }
}]
```

`response` 也可以接受一个函数, 这让配置更灵活

```javascript
[{
    "url": "/mock/users",
    "method": "post",
    "response": (req) => {
        if (req.body.role === 'admin') {
            return {username: 'root'}
        } else {
            return {username: 'foobar'}
        }
    }
}]
```

使用你偏好的数据生成器, 比如 `mockJS`

 ```javascript
[{
    "url": "/mock/users",
    "method": "get",
    "response": (req) => {
        return mockJS.mock({...})
    }
}]
```

解析请求中的 `:` 参数

```javascript
[{
    "url": "/mock/user/:id",
    "method": "get",
    "response": (req) => {
        let id = req.params.id
        return mockJS.mock({...})
    }
}]

增加自定义响应头

```javascript
[{
    "url": "/mock/users",
    "method": "get",
    "headers": {
        "customizeHeader": "foobar"
    },
    "response": (req) => {
        return mockJS.mock({...})
    }
}]
```

延迟 300ms 响应

```javascript
[{
    "url": "/mock/users",
    "method": "get",
    "delay": 300,
    "response": (req) => {
        return mockJS.mock({...})
    }
}]
```

[返回首页](./index.md)