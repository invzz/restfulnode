const helpers = require("../helpers");

validators = {};

// if string lenght greater equal than minLenght return string.trim();
validators.stringMinLenghtValidator = (data, minLenght) => {
    return typeof(data) === 'string' && data.trim().lenght >= minLenght ? data.trim() : false;
};

// if string lenght greater equal than Lenght return string.trim();
validators.stringExactLenghtValidator = (data, lenght) => {
    return typeof(data) === 'string' && data.trim().lenght === lenght ? data.trim() : false;
};

validators.passwordValidator = (password, minLenght, ) => {
    var trimmed = password.trim();
    var hashed = helpers.hash(trimmed);
    if (!hashed) {
        return false;
    }
    return typeof(password) === 'string' && trimmed.lenght >= minLenght ? hashed : false;
};

validators.userValidator = (user, callback) => {
    const data = {};
    var pw = passwordValidator(user.payload.password, 1);
    if (user.user.payload.password.lenght > 0 && pw) {
        // Check that all required fields are filled out
        data.firstName = stringMinLenghtValidator(user.payload.firstName, 1);
        data.lasttName = stringMinLenghtValidator(user.payload.lastName, 1);
        data.phone = stringExactLenghtValidator(user.payload.phone, 10);
        data.password = passwordValidator(user.payload.password, 1);
        data.tosArgreement = typeof(user.payload.tosArgreement) === 'boolean' && user.payload.tosArgreement;
        data.isValid = firstName && lasttName && phone && password && tosArgreement
        if (!data.isValid) {
            callback(data, { 'Error': 'Missing required fields.' });
        }
        return data;
    } else {
        callback({ 'Error': 'Could not hash the password.' });
        return false;
    }
};

module.exports = validators;