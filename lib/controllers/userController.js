const _data = require("../datapipes/fileDatapipe");
const _helpers = require("../helpers")
const { userdata, userquery, stringExactLenghtValidator } = require('../validators/validators');

// container for users submethods
controller = {}

// Users - post
// Required data: firstName, lastName, phone, password, tosArgreement
// Optional data: none
controller.post = function(data, callback) {

    var userObject = userdata(_helpers.toObject(data.payload), (user, err) => {
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


// Users - get
// Required data: phone
// Optional data: none
// TODO Only let authenticated users access their object
controller.get = function(data, callback) {
    // check that the phone number is valid
    var phone = stringExactLenghtValidator(data.query.phone, 10);
    if (phone) {
        _data.read('users', phone, (err, storedData) => {
            if (!err && storedData) {
                // remove the hashed password before returning
                delete storedData.password;
                callback(200, storedData)
            } else {
                callback(404)
            }
        });
    } else {
        callback(400, { 'Error': 'Missing required field' });
    }
};

// Users - put
// Required data: one or more optional data
// Optional data: firstName, lastName, phone, password, tosArgreement
// TODO Only let authenticated users access their object
controller.put = function(data, callback) {
    var userdata = userquery(_helpers.toObject(data.payload), (data, err) => {
        callback(400, err);
    });
    if (userdata) {
        //user lookup
        _data.read('users', userdata.phone, (err, storedData) => {

            // user found
            if (!err && storedData) {

                // update the necessary fields
                if (userdata.firstName) storedData.firstName = userdata.firstName;
                if (userdata.lastName) storedData.lastName = userdata.lastName;
                if (userdata.password) storedData.password = userdata.password;

                // user update
                _data.update('users', userdata.phone, storedData, (err) => {
                    if (!err) { callback(200) } else { callback(500, { 'Error': 'Could not update' }) }
                });
            }
            // not found
            else {

                callback(404, { 'Error': 'user does not found' });
            }
        });

    }
};

controller.delete = function(data, callback) {

};

module.exports = controller;