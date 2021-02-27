/* api services */
const userService = require('./usersService');
const tokensService = require('./tokensService');
const checksService = require('./checksService');

// available services
const services = {

  // CRUD on .data/users
  users: userService,

  // CRUD on .data/tokens
  tokens: tokensService,

  // CRUD on .data/checks
  checks: checksService,

};

// test api responses
services.ping = (data, callback) => callback(200);
services.hello = (data, callback) => callback(200, { message: 'it works' });
services.notfound = (data, callback) => callback(400, { name: 'notfound', payload: {} });

module.exports = services;
