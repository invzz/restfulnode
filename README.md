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
  
request Exapmle
  
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
