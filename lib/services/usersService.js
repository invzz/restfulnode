const dataPipe = require('../pipes/fileDatapipe');
const authService = require('./authService');

const { userdata, userquery, stringExactLenghtValidator } = require('../validators/validators');

// container for submethods
const userService = {};

// users controller
userService.entry = (data, callback) => {
  // accepted methods
  const acceptedMethods = ['post', 'get', 'put', 'delete'];

  // some agents may use lower case method names...
  const method = data.method.toLowerCase();

  // route to the real controller
  if (acceptedMethods.includes(method)) {
    userService[method](data, callback);
  } else {
    callback(405);
  }
};

// Users - post
// Required data: firstName, lastName, phone, password, tosArgreement
// Optional data: none
userService.post = (data, callback) => {
  const userObject = userdata(data.payload, (user, err) => {
    if (user) {
      callback(400, err);
    } else {
      callback(500, err);
    }
  });

  // user validator responds anything else than false or undefined
  if (userObject.isValid) {
    // make sure the user does not already exist
    dataPipe.read('users', userObject.phone, (readErr) => {
      if (readErr) {
        dataPipe.create('users', userObject.phone, userObject, (createErr) => {
          if (!createErr) {
            callback(200);
          } else {
            // console.log(createErr);
            callback(500, { Error: 'Could not create the new user' });
          }
        });
      } else {
        callback(400, { Error: 'user with that phone number already exists' });
      }
    });
    // invalid user
  }
};

// Users - get
// Required data: phone
// Optional data: none

userService.get = (data, callback) => {
  // check that the phone number is valid
  const phone = stringExactLenghtValidator(data.query.phone, 10);
  if (phone) {
    authService.verifyToken(data, phone, (isValidToken) => {
      if (isValidToken) {
        dataPipe.read('users', phone, (err, storedData) => {
          if (!err && storedData) {
            const result = storedData;
            // remove the hashed password before returning
            delete result.password;
            callback(200, storedData);
          } else {
            callback(404, { Error: 'user not found' });
          }
        });
      } else {
        callback(403, { Error: 'Not authenticated or authentication is not valid' });
      }
    });
  } else {
    callback(400, { Error: 'Missing required field' });
  }
};

// Users - put
// Required data: one or more optional data
// Optional data: firstName, lastName, phone, password, tosArgreement
userService.put = (data, callback) => {
  const user = userquery(data.payload, (_data, err) => {
    callback(400, err);
  });
  if (user) {
    authService.verifyToken(data, user.phone, (isAuthenticated) => {
      if (isAuthenticated) {
        // user lookup
        dataPipe.read('users', user.phone, (err, storedData) => {
          // user found
          if (!err && storedData) {
            const result = storedData;
            // update the necessary fields
            if (user.firstName) result.firstName = user.firstName;
            if (user.lastName) result.lastName = user.lastName;
            if (user.password) result.password = user.password;
            // user update
            dataPipe.update('users', user.phone, storedData, (updateError) => {
              if (!updateError) { callback(200); } else { callback(500, { Error: 'Could not update' }); }
            });
          } else {
            callback(404, { Error: 'user not found' });
          }
        });
      } else { callback(403, { Error: 'Not authenticated or authentication is not valid' }); }
    });
  }
};

// Users - get
// Required data: phone
// Optional data: none
// TODO delete all files associated with this user
userService.delete = (data, callback) => {
  const phone = stringExactLenghtValidator(data.query.phone, 10);
  if (phone) {
    authService.verifyToken(data, phone, (isAuthenticated) => {
      if (isAuthenticated) {
        dataPipe.read('users', phone, (err, userData) => {
          if (!err && userData) {
            dataPipe.delete('users', phone, (usrDelError) => {
              if (!usrDelError) {
                const checkList = typeof (userData.checks) === 'object' && userData.checks instanceof Array ? userData.checks : [];
                const checklistLen = checkList.length;
                if (checklistLen > 0) {
                  let checkDeleted = 0;
                  let errors = false;
                  checkList.forEach((checkId) => dataPipe.delete('checks', checkId,
                    (chkDelErr) => {
                      if (chkDelErr) {
                        errors = true;
                      }
                      checkDeleted += 1;
                      if (checkDeleted === checklistLen) {
                        if (!errors) {
                          callback(200, { Deleted: true });
                        } else {
                          callback(500, { Error: 'Could not delete all checks from user.' });
                        }
                      }
                    }));
                }
              } else {
                callback(500, { Error: 'Could not delete the speciefied user' });
              }
            });
          } else {
            callback(400, { Error: 'Could not find the specified user' });
          }
        });
      } else {
        callback(403, { Error: 'Not authenticated or authentication is not valid' });
      }
    });
  } else {
    callback(400, { Error: 'Missing required field' });
  }
};

module.exports = userService.entry;
