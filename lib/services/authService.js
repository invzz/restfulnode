const dataPipe = require('../pipes/fileDatapipe');

const authService = {};

// Verify token is valid for the phone number
authService.verifyToken = (data, phone, callback) => {
  const token = typeof (data.headers.bearer) === 'string' ? data.headers.bearer : false;
  dataPipe.read('tokens', token, (err, tokenData) => {
    if (!err && tokenData) {
      const limit = tokenData.expires > Date.now();
      const isPhoneValid = tokenData.phone === phone;
      if (isPhoneValid && limit) {
        callback(tokenData);
      } else {
        callback(false);
      }
    } else {
      callback(false);
    }
  });
};

// do an action if token in header is valid, execute error if invalid
authService.doAction = (data, success, error) => {
  const token = typeof (data.headers.bearer) === 'string' ? data.headers.bearer : false;
  if (token) {
    dataPipe.read('tokens', token, (authError, authData) => {
      if (!authError && authData) {
        success(authData);
      } else {
        error();
      }
    });
  } else {
    error();
  }
};

// does action only if token.phone matches with given phone, execute error if invalid
authService.verifyAndAction = (data, phone, success, error) => {
  authService.verifyToken(data, phone, (authData) => {
    if (authData) {
      success(authData);
    } else {
      error();
    }
  });
};

module.exports = authService;
