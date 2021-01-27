/* request conbtrollers */

const { userValidator } = require('./validators');
var _data = require('./data');

// controllers (business logic)
var controllers = {
    'notfound': function(data, ok) {
        ok(400, { name: 'notfound', payload: {} });
    }
};

// test api responses
controllers.ping = (data, callback) => callback(200);

// hello welcome message api
controllers.hello = (data, callback) => callback(200, { message: "Welcome to my first RESTFul API!" });

// users controller
controllers.users = (data, callback) => {

    // accepted methods
    var acceptedMethods = ['POST', 'GET', 'PUT', 'DELETE'];

    // route to the real controller
    if (acceptedMethods.includes(data.method)) {
        controllers._users[data.method.toLowerCase](data.callback);
    }

    // method not allowed - 405
    else {
        callback(405);
    }
}

// container for users submethods
controllers._users = {}

// Users - post
// Required data: firstName, lastName, phone, password, tosArgreement
// Optional data: none
controllers._users.post = function(data, callback) {

    var userObject = userValidator(data, (user, err) => {
        if (user) {
            callback(400, err);
        } else {
            callback(500, err);
        }
    });

    // user validator responds anything else than false or undefined
    if (userObject.isValid) {
        // make sure the user does not already exist
        _data.read('users', userObject.phone, (err) => {
            if (err) {
                _data.create('users', userObject.phone, userObject, (err) => {
                    if (!err) {
                        callback(200);
                    } else {
                        console.log(err);
                        callback(500, { 'Error': 'Could not create the new user' });
                    }
                });
            } else {
                console.log(err);
                callback(400, { 'Error': 'user with that phone number already exists' });
            }
        });
        // invalid user
    }
};

controllers._users.get = function(data, callback) {

};

controllers._users.put = function(data, callback) {

};

handlers._users.delete = function(data, callback) {

};

modules.export = controllers;