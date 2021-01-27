const _data = require("../datapipes/fileDatapipe");
const _helpers = require("../helpers")
const { userdata, userquery, stringExactLenghtValidator } = require('../validators/validators');

// container for submethods
service = {}

// Users - post
// Required data: firstName, lastName, phone, password, tosArgreement
// Optional data: none
service.post = function(data, callback) {

    var userObject = userdata(_helpers.parseJson(data.payload), (user, err) => {
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
service.get = function(data, callback) {
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
// TODO Only let authenticated users update their object
service.put = function(data, callback) {
    var userdata = userquery(_helpers.parseJson(data.payload), (data, err) => {
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



// Users - get
// Required data: phone
// Optional data: none
// TODO Only let authenticated users delete their object
// TODO delete all files associated with this user
service.delete = function(data, callback) {
    // check that the phone num is valid
    // check that the phone number is valid
    var phone = stringExactLenghtValidator(data.query.phone, 10);
    if (phone) {
        _data.read('users', phone, (err, storedData) => {

            if (!err && storedData) {
                _data.delete('users', phone, (err) => {
                    if (!err) return callback(200, { 'Deleted': storedData.phone });
                    else return callback(500, { 'Error': 'Could not delete the speciefied user' })
                });

            } else {
                callback(400, 'Could not find the specified user')
            }
        });
    } else {
        callback(400, { 'Error': 'Missing required field' });
    }
};

module.exports = service;