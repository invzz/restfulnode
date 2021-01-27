const helpers = require("../helpers");

_validateUserFields = (user, validate) => {
    var data = {};
    data.firstName = validators.stringMinLenghtValidator(user.firstName, 1);
    data.lastName = validators.stringMinLenghtValidator(user.lastName, 1);
    data.phone = validators.stringExactLenghtValidator(user.phone, 10);
    data.password = helpers.hash(validators.stringMinLenghtValidator(user.password, 1));
    data.tosArgreement = typeof(user.tosArgreement) === 'boolean' && user.tosArgreement;
    data.isValid = validate(data);
    return data;
};

validators = {};

// if string lenght greater equal than minLenght return string.trim();
validators.stringMinLenghtValidator = (string, MIN_LEN) => {
    if (string) {
        var isRightType = typeof(string) === 'string';
        var trimmed = string.trim();
        return isRightType && trimmed.length >= MIN_LEN ? trimmed : false;
    }

};

// if string lenght greater equal than Lenght return string.trim();
validators.stringExactLenghtValidator = (string, LEN) => {
    if (string) {
        return typeof(string) === 'string' && string.trim().length === LEN ? string.trim() : false;
    }

};

validators.userquery = (user, callback) => {
    var data = _validateUserFields(user, (parsedUserFields) => {
        if (parsedUserFields.phone) {
            return parsedUserFields.firstName ||
                parsedUserFields.lastName ||
                parsedUserFields.password;
        } else { return false; }
    });

    if (data.phone) {
        if (!data.isValid) {
            callback(data, { 'Error': 'No field to be updated', 'request': user, 'parsed': data });
            return false;
        };
        return data;
    } else {
        callback(data, { 'Error': 'Missing required parameter', 'request': user, 'parsed': data });
        return false;
    }
};

validators.userdata = (user, callback) => {
    data = _validateUserFields(user,
        (data) =>
        data.firstName &&
        data.lastName &&
        data.phone &&
        data.password &&
        data.tosArgreement
    );
    if (!data.isValid) {
        callback(data, { 'Error': 'Error creating user object.', 'request': user, 'parsed': data });
        return false;
    }
    return data;
};


module.exports = validators;