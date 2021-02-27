const dataPipe = require('../pipes/fileDatapipe');

const authService = {};

// Verify token il valid for the phone number
authService.verifyToken = (data, phone, callback) => {
  const token = typeof (data.headers.bearer) === 'string' ? data.headers.bearer : false;
  dataPipe.read('tokens', token, (err, tokenData) => {
    if (!err && tokenData) {
      const limit = tokenData.expires > Date.now();
      const isPhoneValid = tokenData.phone === phone;
      if (isPhoneValid && limit) {
        callback(true);
      } else {
        callback(false);
      }
    } else {
      callback(false);
    }
  });
};

module.exports = authService;
