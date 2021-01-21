/* NODEJS api */

/* andres coronado */

/* API in node (puro) */

// dependencies
var http = require('http');
var URL = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var env = require('./config.js');;


// get useful packed data to work with
function parse(request, payload) {
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

// controllers with business logic
var controllers = {
    'demo': function(data, ok) {
        ok(200, { name: 'api', payload: { 'name': 'sample' } });
    },

    'notfound': function(data, ok) {
        ok(400, { name: 'notfound', payload: {} });
    }
};

// router
var routes = {
    'demo': controllers.demo,
    'notfound': controllers.notfound,
}




// create the server
const server = http.createServer(
    function(request, response) {

        const decoder = new StringDecoder('utf-8');
        var buffer = '';

        // open stream and decode data when as it comes to the server
        request.on('data', (data) => buffer += decoder.write(data));

        // when data has been receiveid 
        request.on('end', () => {

            // end buffer string which holds the reques body 
            buffer += decoder.end();

            // getting useful object to work with from request
            var data = parse(request);

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
    });


// binding server to port, start to listen and displaying a message
server.listen(env.port, () => console.log("[ Server ] Listening on port : " + env.port));