---
layout: page
title: Mock
---

all mock api config files list on the `.nva/mock`, support `.json`, `.js` settings file

```js
[{
    "url": "/mock/user",    /* request url */
    "method": "get",        /* request method */
    "response": {           /* response */
        "code": 200,        /* response code */
        "data": {           /* response data */
            "id": 6,
            "name": "Mr.smith"
        }
    }
}]
```

you can also use [JSON Schema](http://json-schema.org) along with fake generators to provide consistent and meaningful fake data for your system

```json
[{
    "url": "/mock/users",
    "method": "get",
    "type": "jsf",
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

the `response` field also can defined as function, make mock api more flexible

```javascript
[{
    "url": "/mock/users",
    "method": "get",
    "type": "jsf",
    "response": (req) => {
        if (req.body.role === 'admin') {
            return {username: 'root'}
        } else {
            return {username: 'foobar'}
        }
    }
}]
```

then choose your own preferred fake data generator, like `mockJS`

 ```javascript
[{
    "url": "/mock/users",
    "method": "get",
    "type": "jsf",
    "response": (req) => {
        return mockJS.mock({...})
    }
}]
```

[Back to Index](./index.md)