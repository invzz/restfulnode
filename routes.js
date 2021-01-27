/* routes */

const services = require("./lib/services/services");

// router for request
var routes = {
    'notfound': services.notfound,
    'users': services.users,
    'tokens': services.tokens,
    'hello': services.hello,
    'ping': services.ping,
}
module.exports = routes;