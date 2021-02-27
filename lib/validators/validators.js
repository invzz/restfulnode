const helpers = require('../helpers');
const routes = require('../router/routes');

const validators = {};

const validateUserFields = (user, validate) => {
  const data = {};
  data.firstName = validators.stringMinLenghtValidator(user.firstName, 1);
  data.lastName = validators.stringMinLenghtValidator(user.lastName, 1);
  data.phone = validators.stringExactLenghtValidator(user.phone, 10);
  data.password = helpers.hash(validators.stringMinLenghtValidator(user.password, 1));
  data.tosAgreement = typeof (user.tosAgreement) === 'boolean' && user.tosAgreement;
  data.isValid = validate(data);
  return data;
};

const validateCheckFields = (check, validate) => {
  const data = {};

  data.protocol = typeof (check.protocol) === 'string' && ['https', 'http']
    .indexOf(check.protocol) > -1 ? check.protocol : false;

  data.url = typeof (check.url) === 'string'
    && routes.checks.url.trim() > 0 ? routes.checks.url.trim() : false;

  data.method = typeof (check.method) === 'string'
    && ['post', 'put', 'get', 'delete']
      .indexOf(check.check.protocol.toLocaleLowerCase()) > -1
    ? check.protocol.toLocaleLowerCase()
    : false;

  data.successCodes = typeof (check.successCodes) === 'object'
    && data.successCodes instanceof Array
    && data.successCodes.length > 0 ? data.successCodes : false;

  data.timeoutSeconds = typeof (data.timeoutSeconds) === 'number'
    && data.timeoutSeconds % 1 === 0
    && data.timeoutSeconds >= 1
    && data.timeoutSeconds <= 5 ? data.timeoutSeconds : false;

  data.isValid = validate(data);
  return data;
};

// if string lenght greater equal than minLenght return string.trim();
validators.stringMinLenghtValidator = (string, MIN_LEN) => {
  if (string) {
    const isRightType = typeof (string) === 'string';
    const trimmed = string.trim();
    return isRightType && trimmed.length >= MIN_LEN ? trimmed : false;
  }
  return false;
};

// if string lenght greater equal than Lenght return string.trim();
validators.stringExactLenghtValidator = (string, LEN) => {
  if (string) {
    return typeof (string) === 'string' && string.trim().length === LEN ? string.trim() : false;
  }
  return false;
};

validators.userquery = (user, callback) => {
  const data = validateUserFields(user, (parsedUserFields) => {
    if (parsedUserFields.phone) {
      return parsedUserFields.firstName
        || parsedUserFields.lastName
        || parsedUserFields.password;
    } return false;
  });

  if (data.phone) {
    if (!data.isValid) {
      callback(data, { Error: 'No field to be updated', request: user, parsed: data });
      return false;
    }
    return data;
  }
  callback(data, { Error: 'Missing required parameter', request: user, parsed: data });
  return false;
};

validators.userdata = (user, callback) => {
  const data = validateUserFields(user,
    (normalizedData) => normalizedData.firstName
      && normalizedData.lastName
      && normalizedData.phone
      && normalizedData.password
      && normalizedData.tosAgreement);
  if (!data.isValid) {
    callback(data, { Error: 'Missing arguments.', request: user, parsed: data });
    return false;
  }
  return data;
};

validators.tokendata = (user, callback) => {
  const data = validateUserFields(user,
    (normalizedData) => normalizedData.phone
      && normalizedData.password);
  if (!data.isValid) {
    callback(data, { Error: 'Missing arguments.', request: user, parsed: data });
    return false;
  }
  return data;
};

validators.checksData = (check, callback) => {
  const data = validateCheckFields(check,
    (normalizedData) => normalizedData.protocol
      && normalizedData.url
      && normalizedData.method
      && normalizedData.successCodes
      && normalizedData.timeoutSeconds);
  if (!data.isValid) {
    callback(data, { Error: 'Missing arguments.', request: check, parsed: data });
    return false;
  }
  return data;
};

module.exports = validators;
