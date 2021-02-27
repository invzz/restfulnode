const { checksData } = require('../validators/validators');
const authService = require('./authService');
const config = require('../../config');
const helpers = require('../helpers');
const dataPipe = require('../pipes/fileDatapipe');

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
  const checkObject = checksData(data.payload, (checkObj, err) => {
    if (checkObj) {
      callback(400, err);
    } else {
      callback(500, err);
    }
  });
  if (checkObject.isValid) {
    authService.verifyToken(data);
    const token = typeof (data.headers.bearer) === 'string' ? data.headers.bearer : false;
    dataPipe.read('tokens', token, (tokenReadError, tokenData) => {
      if (!tokenReadError && tokenData) {
        const userPhone = tokenData.phone;
        dataPipe.read('users', userPhone, (userReadError, userData) => {
          if (!userReadError && userData) {
            const userChecks = typeof (userData.checks) === 'object' && userData.checks instanceof Array ? userData.checks : [];
            // verify that the user has less than max num of checks
            if (userChecks.lenght < config.maxChecks) {
              // create a random id for the checks
              const checkId = helpers.createToken(20);

              // append to the check object
              checkObject.id = checkId;
              checkObject.phone = userPhone;

              // store the object
              dataPipe.create('checks', checkObject.id, checkObject, (createErr) => {
                if (!createErr) {
                  const updatedUser = userData;
                  // add the check id to the user object
                  updatedUser.checks = userChecks;
                  updatedUser.checks.push(checkId);

                  dataPipe.update('users', userPhone, updatedUser, (upErr) => {
                    if (!upErr) {
                      callback(200, checkObject);
                    } else {
                      callback(500, { Error: 'Could not update the user with the new check' });
                    }
                  });
                } else {
                  callback(500, 'Could not create the file for Checks');
                }
              });
            } else {
              callback(400, 'Maximum number of checks reached');
            }
          } else {
            callback(403);
          }
        });
      } else {
        callback(400, { Error: 'Missing required inputs or inputs are invalid' });
      }
    });
  }
};

// checksService.get = (data, callback) => { };

// checksService.put = (data, callback) => { };

// checksService.delete = (data, callback) => { };

module.exports = checksService;
