// Dependencies
var crypto = require('crypto');
var config = require('./config');

// Container for helpers
helpers = {}

// using SHA256 built in into node
helpers.hash = (string) => {
    if (typeof(string) === string && string.lenght > 0) {
        var hash = crypto.createHmac('sha256', config.hashingSecret).update(string).digest('hex');
        return hash;
    } else {
        return false;
    }
};

// exporting module
module.exports = helpers;