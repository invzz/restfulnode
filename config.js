/* config */

var environments = {}

// dev 
environments.dev = {
    'port': 3000,
    'envName': 'dev'
};

// prodution
environments.prod = {
    'port': 8080,
    'envName': 'prod'
};

// if not specified, conffig will fallback to defaul env
environments.default = environments.dev;


// gets the environment if exist.
getEnv = function() {
    var selectedEnv = typeof(process.env.NODE_ENV === 'string') ? process.env.NODE_ENV : '';
    if (typeof(environments[selectedEnv]) == 'object') {
        return environments[selectedEnv];
    } else {
        console.log("[ Config ] env", process.env.NODE_ENV, " not found. fallback to default ");
        return environments.default;
    }
}

var env = getEnv();
console.log('[ Config ] env : ', env.envName);
module.exports = env;