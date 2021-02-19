# RESTful APIs in pure node.js

- Basic API server with routing and controllers.
  - handles `GET` `POST` `PUT` `DELETE` requests.
  - supports  `HTTPS` and  `HTTP`
  - Using file system and file descriptors
  
- Supports *http* and *https* protocols.

- Supports environment variable `NODE_ENV`
  - `dev` for development
  - `prod` for production
  - any other env can be defined in `config.js`
  
- Runs only node.js and node modules without third party dependencies.
- Server-Side "Vanilla" JS

- run with
  
``` node index.js ```

## API

### /users

- handles `GET` `POST` `PUT` `DELETE` requests.
  
- post request Example
  
```json
{
    "firstName": "john",
    "lastName": "smith",
    "password": "antani",
    "phone": "0166533425",
    "tosArgreement": true,
    "isValid": true
}
```

- `GET` request example `<deployed address>//users?phone=0106533425`
- `GET` response example:
  
```json
{
    "firstName": "john",
    "lastName": "aaa",
    "phone": "010653425",
    "tosArgreement": true,
    "isValid": true
}
```

- `PUT` request example

```json
{
    "firstName": "newfirstname",
    "lastName": "newname",
    "password": "newpass",
    "phone": "0106533425"
}
```
