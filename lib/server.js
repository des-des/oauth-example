var Hapi = require('hapi');
var querystring = require('querystring');
var http = require('https');
require('env2')('config.env');

var port = process.env.PORT || 4000;

var server = new Hapi.Server();
server.connection({ port: port });

var makeRequest = function(options, cb) {
  var request = http.request(options, function(response) {
    var body = '';
    if (response.statusCode !== 200) {
      // what should we do here?
    }
    response.on('data', function(chunk) {
      body += chunk;
    });
    response.on('end', function() {
      cb(null, body);
    });
  })
  request.on('error', function(error) {
    console.error('request failed!');
    cb(error);
  });
  request.write(options.body);
  request.end();
}


server.route([{
// This is the first step. The user wants to authenticate so we provide them
// with a url to the third party that will authenticate them. This url ends with
// a query (ie ?key=value&key ...). This query includes the client id given to
// us by the third party to identify our app. It also includes a redirect url,
// this is where the user will get sent back after they have authenticated.
    path: '/login',
    method: 'GET',
    handler: function(request, reply) {
      var params = {
        client_id : process.env.GITHUB_CLIENT_ID,
        redirect_uri : process.env.BASE_URL + '/welcome'
      }
      reply.redirect(
        'https://github.com/login/oauth/authorize?'
          + querystring.stringify(params)
      );
    },
  }, {
// This is where the user gets sent after they have autherised our app and
// authenticated themselves with the 3rd party. The third party has attached
// a query to the url the user has been redirected to. Ie /welcome?code=1234.
// This query contains a code. We will use this to prove to the 3rd party that
// The user has authenticated.
  path:'/welcome',
  method: 'GET',
  handler: function(request, reply) {
    var payload = querystring.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code: request.query.code
    });
// Using the code in the query we can get the users access token from the 3rd
// party. We also need our client id and our client secret. This is to assure
// the 3rd party that we are who we say we are.
    makeRequest({
      hostname : 'github.com',
      path     : '/login/oauth/access_token',
      method   : 'POST',
      port     : '443',
      headers  : {
        'Accept'        : 'application/json',
        'Content-Type'  : 'application/x-www-form-urlencoded',
        'Content-Length': payload.length
      },
      body: payload
    }, function(err, response) {
// Now we have the access token! a common next step would be to request some
// basic user information from the 3rd party. Ie name and email.
      if (err) {
        throw err; // should we do something better here?
      }
      reply(response);
    })
  }
}]);

server.start(function(err) {
  if (err) {
    console.error(err);
  } else {
    console.log('server listening on port ' + port);
  }
});

module.exports = server;
