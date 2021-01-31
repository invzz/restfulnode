/* api services */
const userService = require('./usersService');
const tokensService = require('./tokensService');

// available services
const services = {

  // CRUD on .data/users
  users: userService,

  // CRUD on .data/tokens
  tokens: tokensService,

};

// test api responses
services.ping = (data, callback) => callback(200);
services.hello = (data, callback) => callback(200, { message: 'it works' });
services.notfound = (data, callback) => callback(400, { name: 'notfound', payload: {} });

module.exports = services;
