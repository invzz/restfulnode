// deps
const dataPipe = require('../pipes/fileDatapipe');
const helpers = require('../helpers');
const { tokendata, stringExactLenghtValidator } = require('../validators/validators');

const tokensService = {};

tokensService.entry = (data, callback) => {
  // accepted methods
  const acceptedMethods = ['post', 'get', 'put', 'delete'];
  // some agents may use lower case method names...
  const method = data.method.toLowerCase();
  // route to the real controller
  if (acceptedMethods.includes(method)) {
    tokensService[method](data, callback);
  } else {
    callback(405);
  }
};

// get a new token
tokensService.post = (data, callback) => {
  const tokenRequestObj = tokendata(data.payload,
    (user, err) => {
      if (user) {
        callback(400, err);
      } else {
        callback(500, err);
      }
    });
    // lookup the user
  if (tokenRequestObj.isValid) {
    dataPipe.read('users', tokenRequestObj.phone, (err, userData) => {
      if (!err && userData) {
        // compare (hashed) passwords
        if (userData.password === tokenRequestObj.password) {
          const tokenObj = {};
          tokenObj.phone = tokenRequestObj.phone;
          tokenObj.tokenId = helpers.createToken(20);
          tokenObj.expires = Date.now() + 1000 * 60 * 60;
          // store token
          dataPipe.create('tokens', tokenObj.tokenId, tokenObj, (CreateError) => {
            if (!CreateError) {
              callback(200, tokenObj);
            } else {
              callback(500, 'Could not create new token');
            }
          });
        } else {
          callback(400, { Error: 'Wrong password' });
        }
      } else {
        callback(400, { Error: 'User not found' });
      }
    });
  }
};

// get tokenObj given token
tokensService.get = (data, callback) => {
  // check that the phone number is valid
  const id = stringExactLenghtValidator(data.query.id, 20);
  if (id) {
    dataPipe.read('tokens', id, (err, tokenData) => {
      if (!err && tokenData) {
        callback(200, tokenData);
      } else {
        callback(404, { Error: 'tokenId not found' });
      }
    });
  } else {
    callback(400, { Error: 'Missing required field' });
  }
};

// refresh token
tokensService.put = (data, callback) => {
  const tokenId = stringExactLenghtValidator(data.payload.token, 20);
  const extend = typeof (data.payload.extend) === 'boolean' && data.payload.extend;
  if (tokenId && extend) {
    dataPipe.read('tokens', tokenId, (err, tokenData) => {
      if (!err && tokenData) {
        if (tokenData.expires > Date.now()) {
          const newTokenObj = tokenData;
          newTokenObj.expires = Date.now() + 1000 * 60 * 60;
          dataPipe.update('tokens', tokenId, newTokenObj, (updateError) => {
            if (!updateError) {
              callback(200, { expires: tokenData.expires });
            } else {
              callback(500, { Error: 'Could not update the tokens' });
            }
          });
        }
      } else {
        callback(400, { Error: 'token not found' });
      }
    });
  } else {
    callback(400, { Error: 'Missing required field(s) or invalid request' });
  }
};

// delete
tokensService.delete = (data, callback) => {
  const tokenId = stringExactLenghtValidator(data.payload.token, 20);
  if (tokenId) {
    dataPipe.read('tokens', tokenId, (err, storedData) => {
      if (!err && storedData) {
        dataPipe.delete('tokens', tokenId, (deleteError) => {
          if (!deleteError) return callback(200, { Deleted: tokenId });
          return callback(500, { Error: 'Could not delete the speciefied tokenId' });
        });
      } else {
        callback(400, 'Could not find the specified tokenId');
      }
    });
  } else {
    callback(400, { Error: 'Missing required field' });
  }
};

module.exports = tokensService.entry;
