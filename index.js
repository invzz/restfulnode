/* eslint-disable no-console */
/* entry point */

// dependencies

// http protocol and server
const http = require('http');

// https protocol and server
const https = require('https');

// file system to access files
const fs = require('fs');

// decodes strings using (UTF-8)
const { StringDecoder } = require('string_decoder');

// environments
const env = require('./config.js');

// routes
const routes = require('./routes');

// helper functions
const helpers = require('./lib/helpers');

// All server logic for both http and https
const unifiedServer = (request, response) => {
  // decodes data to utf8
  const decoder = new StringDecoder('utf-8');

  // buffer to store data stream
  let buffer = '';

  // open stream and decode data when as it comes to the server
  request.on('data', (data) => { buffer += decoder.write(data); });

  // when data has been receiveid
  request.on('end', () => {
    // end buffer string which holds the reques body
    buffer += decoder.end();

    // getting useful object to work with from request
    const data = helpers.reqToObj(request, buffer);

    // log request
    console.log('[ request ] ', data);

    // routing to the right controller
    const controller = routes[data.route] ? routes[data.route] : routes.notfound;

    // executing controller
    controller(data, (HTTPstatus, result) => {
      const status = HTTPstatus || 200;

      // default result empty object
      const resultObj = typeof (result) === 'object' ? result : {};

      // Content type
      response.setHeader('Content-Type', 'application/json');

      // Response status
      response.writeHead(status);

      // send response
      response.end(JSON.stringify(resultObj));

      // log response
      console.log('[ response ] ', resultObj);
    });
  });
};

// http server definition
const httpServer = http.createServer(
  (request, response) => {
    unifiedServer(request, response);
  },
);

// https Server definition
const httpsServerOptions = {
  key: fs.readFileSync('./https/key.pem'),
  cert: fs.readFileSync('./https/cert.pem'),
};

// create the https server
const httpsServer = https.createServer(
  httpsServerOptions,
  (request, response) => unifiedServer(request, response),
);

// starting http server
httpServer.listen(env.httpPort, () => console.log(`[ HTTP  ] Listening on port : ${env.httpPort}`));

// starting http server
httpsServer.listen(env.httpsPort, () => console.log(`[ HTTPS ] Listening on port : ${env.httpsPort}`));
