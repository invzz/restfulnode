// Dependencies

const URL = require('url');
const crypto = require('crypto');
const config = require('../config');
// pares urls

// Container for helpers
const helpers = {};

// Parse a Json to Obj in all cases witout throwing
helpers.parseJson = (json) => {
  try {
    const obj = JSON.parse(json);
    return obj;
  } catch (e) {
    return {};
  }
};

// create a pseudo-random token of 20 chars
helpers.createToken = (len) => crypto.randomBytes(len / 2).toString('hex');

// request to object funtion
helpers.reqToObj = (request, payload) => {
  const { headers, method, url } = request;
  const parsedUrl = URL.parse(url, true);
  return {
    url,
    payload: helpers.parseJson(payload),
    headers,
    method,
    // using regex to parse the last bit of the /url/ -> url
    route: parsedUrl.pathname.replace(/^\/+|\/+$/g, ''),
    query: parsedUrl.query,
  };
};

// using SHA256 built in into node
helpers.hash = (string) => {
  if (typeof (string) === 'string' && string.length > 0) {
    const hash = crypto.createHmac('sha256', config.hashingSecret).update(string).digest('hex');
    return hash;
  }
  return false;
};

// verify token id is valid for a user

// exporting module
module.exports = helpers;
