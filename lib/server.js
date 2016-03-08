var Hapi = require('hapi');
var querystring = require('querystring');
var http = require('https');
require('env2')('config.env');

var port = process.env.PORT || 8000;

var server = new Hapi.Server();
server.connection({ port: port });

server.register(require("inert"), function(err){
  if(err){
    throw err;
  }
});

var makeRequest = function(options, cb) {
  var request = http.request(options, function(response) {
    var body = '';
    if (response.statusCode !== 200) {
    }
    response.on('data', function(chunk) {
      body += chunk;
    });
    response.on('end', function() {
      cb(null, body);
    });
  });
  request.on('error', function(error) {
    console.error('request failed!');
    cb(error);
  });
  request.write(options.body);
  request.end();
};

server.route([{
    path: '/getData',
    method: 'GET',
    handler: function(request, reply) {
      var token = request.state.access_token;
      var options = {
        hostname: 'api.github.com',
        path: '/user',
        method: 'GET',
        body: "",
        headers: {
          Authorization : token,
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.85 Safari/537.36',
        }
      };
      makeRequest(options,function(err, response){
        console.log(response);
        reply(response);
      });

    },
  },{
    path: '/login',
    method: 'GET',
    handler: function(request, reply) {
      var params = {
        client_id : process.env.GITHUB_CLIENT_ID,
        redirect_uri : process.env.BASE_URL + '/welcome'
      };
      reply.redirect(
        'https://github.com/login/oauth/authorize?'+ querystring.stringify(params)
      );
    },
  }, {
  path:'/welcome',
  method: 'GET',
  handler: function(request, reply) {
    console.log(request.url.query.code);
    var payload = querystring.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code: request.query.code
    });
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
      if (err) {
        throw err;
      }
      var token = JSON.parse(response).access_token;
      console.log(token);
      reply.file("./public/index.html").state("access_token", token);
    });
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
