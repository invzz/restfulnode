const { checksData } = require('../validators/validators');
const authService = require('./authService');

const checksService = {};

checksService.entry = (data, callback) => {
  // accepted methods
  const acceptedMethods = ['post', 'get', 'put', 'delete'];
  // some agents may use lower case method names...
  const method = data.method.toLowerCase();
  // route to the real controller
  if (acceptedMethods.includes(method)) {
    checksService[method](data, callback);
  } else {
    callback(405);
  }
};

// checks-post
// protocol, url, method, successCodes, timeoutSeconds
// optional: none
checksService.post = (data, callback) => {
  // validate inputs
  const checkObject = checksData(data.payload, (user, err) => {
    if (user) {
      callback(400, err);
    } else {
      callback(500, err);
    }
  });
  if (checkObject.isValid) {
    authService.verifyToken(data);
  }
};

checksService.get = (data, callback) => { };

checksService.put = (data, callback) => { };

checksService.delete = (data, callback) => { };

module.exports = checksService;
