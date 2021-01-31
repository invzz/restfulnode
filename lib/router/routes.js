/* routes */

const services = require('../services/services');

// router for request
const routes = {
  notfound: services.notfound,
  users: services.users,
  tokens: services.tokens,
  checks: services.checks,
  hello: services.hello,
  ping: services.ping,
};
module.exports = routes;
