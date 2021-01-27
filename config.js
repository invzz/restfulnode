/* config */

var environments = {}

// dev 
environments.dev = {
    'httpPort': 3000,
    'httpsPort': 3001,
    'hashingSecret': 'secret',
    'envName': 'dev'
};

// prodution
environments.prod = {
    'httpPort': 8080,
    'httpsPort': 8081,
    'hashingSecret': 'secret',
    'envName': 'prod'
};

// if not specified, conffig will fallback to defaul env
environments.default = environments.dev;


// gets the environment if exist.
getEnv = () => {
    var selectedEnv = typeof(process.env.NODE_ENV === 'string') ? process.env.NODE_ENV : '';
    if (typeof(environments[selectedEnv]) == 'object') {
        return environments[selectedEnv];
    } else {
        console.log("[ Config ] env", process.env.NODE_ENV, " not found. fallback to default ");
        return environments.default;
    }
}


// getting env to be set
var env = getEnv();

// logs current environment in use
console.log('[ Config ] env : ', env.envName);

// exports env
module.exports = env;