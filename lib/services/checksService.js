const { checkObjectAnyField, checkObjectAllFields, stringExactLenghtValidator } = require('../validators/validators');
const config = require('../../config');
const helpers = require('../helpers');
const dataPipe = require('../pipes/fileDatapipe');
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
  const checkObject = checkObjectAllFields(data.payload, (checkObj, err) => {
    if (checkObj) {
      callback(400, err);
    } else {
      callback(500, err);
    }
  });

  authService.doAction(data, (authData) => {
    const userPhone = authData.phone;
    dataPipe.read('users', userPhone, (userReadError, userData) => {
      if (!userReadError && userData) {
        const userChecks = typeof (userData.checks) === 'object' && userData.checks instanceof Array ? userData.checks : [];
        // verify that the user has less than max num of checks
        if (userChecks.length < config.maxChecks) {
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
              callback(500, { Error: 'Could not create the file for Checks' });
            }
          });
        } else {
          callback(400, { Error: 'Maximum number of checks reached' });
        }
      } else {
        callback(400, { Error: 'User not found :-/ ' });
      }
    });
  },
  () => callback(403, { Error: 'Authentication error' }));
};

// checks=get
// required field:  id
checksService.get = (data, callback) => {
  const id = stringExactLenghtValidator(data.query.id, 20);
  if (id) {
    // lookup the check
    dataPipe.read('checks', id, (checkErr, checkData) => {
      if (!checkErr && checkData) {
        // checking that the given token is valid and belongs
        // to the same user who created it.
        authService.verifyAndAction(data, checkData.phone,
          () => {
            callback(200, checkData);
          },
          // Authentication error, or the requested file
          // was created by another user.
          () => callback(403, { Error: 'Authentication error' }));
      } else {
        // check record does not exist.
        callback(404, { Error: 'Cannot find Check Id' });
      }
    });
  }
};

// checks-put
// required data: id, protocol, url, method, successCodes, timeoutSeconds
// at least 1 parameter is required.

checksService.put = (data, callback) => {
  const id = stringExactLenghtValidator(data.payload.id, 20);
  if (id) {
    const checkObject = checkObjectAnyField(data.payload, (checkObj, err) => {
      if (checkObj) {
        callback(400, err);
      } else {
        callback(500, err);
      }
    });
    dataPipe.read('checks', id, (readErr, check) => {
      if (!readErr && check) {
        const updated = check;
        authService.verifyAndAction(data, check.phone, () => {
          if (checkObject.protocol) {
            updated.protocol = checkObject.protocol;
          }
          if (checkObject.method) {
            updated.method = checkObject.method;
          }
          if (checkObject.url) {
            updated.url = checkObject.url;
          }
          if (checkObject.timeoutSeconds) {
            updated.timeoutSeconds = checkObject.timeoutSeconds;
          }
          if (checkObject.successCodes) {
            updated.successCodes = checkObject.successCodes;
          }
          delete updated.id;
          dataPipe.update('checks', id, updated, (upErr, upData) => {
            if (!upErr && upData) {
              callback(200, upData);
            } else {
              callback(400, { Error: `Could not Update check ${id}` });
            }
          });
        },
        () => callback(403, { Error: 'Authentication Error' }));
      } else {
        callback(400, { Error: 'Check id not found' });
      }
    });
  } else {
    callback(400, { Error: 'Missing required field ' });
  }
};

// checksService.delete = (data, callback) => { };

module.exports = checksService.entry;
