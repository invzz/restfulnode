// Dependencies
var crypto = require('crypto');
var config = require('../config');

// Container for helpers
helpers = {}

// using SHA256 built in into node
helpers.hash = (string) => {
    if (typeof(string) === 'string' && string.length > 0) {
        var hash = crypto.createHmac('sha256', config.hashingSecret).update(string).digest('hex');
        return hash;
    } else {
        return false;
    }
};

// Parse a Json to Obj in all cases witout throwing 
helpers.toObject = (json) => {
    try {
        var obj = JSON.parse(json);
        return obj;
    } catch (e) {
        return {}
    }
};

// exporting module
module.exports = helpers;