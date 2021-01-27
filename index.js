/* entry point */

// dependencies

// http protocol and server
var http = require('http');

// https protocol and server
var https = require('https');


// file system to access files
var fs = require('fs');

// decodes strings using (UTF-8)
var StringDecoder = require('string_decoder').StringDecoder;

// environments
var env = require('./config.js');

// routes
var routes = require('./routes');

// helper functions
var helpers = require('./lib/helpers')



// http server definition 
const httpServer = http.createServer(
    function(request, response) {
        unifiedServer(request, response);
    });

// https Server definition
var httpsServerOptions = {
    'key': fs.readFileSync('./https/key.pem'),
    'cert': fs.readFileSync('./https/cert.pem'),
};

// create the https server
const httpsServer = https.createServer(
    httpsServerOptions,
    (request, response) => unifiedServer(request, response)
);

//starting http server
httpServer.listen(env.httpPort, () => console.log("[ HTTP  ] Listening on port : " + env.httpPort));

//starting http server
httpsServer.listen(env.httpsPort, () => console.log("[ HTTPS ] Listening on port : " + env.httpsPort));


// All server logic for both http and https
var unifiedServer = function(request, response) {
    // decodes data to utf8
    const decoder = new StringDecoder('utf-8');

    // buffer to store data stream
    var buffer = '';

    // open stream and decode data when as it comes to the server
    request.on('data', (data) => buffer += decoder.write(data));

    // when data has been receiveid 
    request.on('end', () => {

        // end buffer string which holds the reques body 
        buffer += decoder.end();

        // getting useful object to work with from request
        var data = helpers.reqToObj(request, buffer);

        // log request
        console.log('[ request ] ', data);

        // routing to the right controller
        var controller = !!routes[data.route] ? routes[data.route] : routes['notfound'];

        // executing controller
        controller(data, (status, result) => {
            // default status 200
            status = !!status ? status : 200;

            // default result empty object
            result = typeof(result) === 'object' ? result : {};

            // Content type
            response.setHeader('Content-Type', 'application/json');

            // Response status 
            response.writeHead(status);

            // send response
            response.end(JSON.stringify(result));

            // log response
            console.log('[ response ] ', result);
        });
    });
};