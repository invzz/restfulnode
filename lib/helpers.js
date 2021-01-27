// Dependencies
var crypto = require('crypto');
var config = require('../config');
// pares urls
var URL = require('url');



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
helpers.parseJson = (json) => {
    try {
        var obj = JSON.parse(json);
        return obj;
    } catch (e) {
        return {}
    }
};



// request to object funtion
helpers.reqToObj = (request, payload) => {
    const { headers, method, url } = request;
    const parsedUrl = URL.parse(url, true);
    return {
        url: url,
        payload: payload,
        headers: headers,
        method: method,
        // using regex to parse the last bit of the /url/ -> url
        route: parsedUrl.pathname.replace(/^\/+|\/+$/g, ''),
        query: parsedUrl.query,
    }
}

// exporting module
module.exports = helpers;