/* request conbtrollers */
const userController = require('./userController');

// controllers (business logic)
var controllers = {
    'notfound': function(data, callback) {
        callback(400, { name: 'notfound', payload: {} });
    }
};

// test api responses
controllers.ping = (data, callback) => callback(200);

// hello welcome message api
controllers.hello = (data, callback) => callback(200, { message: "Welcome to my first RESTFul API!" });

// users controller
controllers.users = (data, callback) => {
    // user controller internal object
    controllers._users = userController;

    // accepted methods
    var acceptedMethods = ['post', 'get', 'put', 'delete'];

    // some agents may use lower case method names...
    var method = data.method.toLowerCase();

    // route to the real controller
    if (acceptedMethods.includes(method)) {
        controllers._users[method](data, callback);
    }

    // method not allowed - 405
    else {
        callback(405);
    }
}



module.exports = controllers;