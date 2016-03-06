var test = require('tape');
var url = require('url');
var querystring = require('querystring');
var nock = require('nock');
require('env2')('config.env');


var server = require('../lib/server.js');

test('/login endpoint redirects to gh', function(t) {
  var actual, expected;

  var options = {
    url: '/login',
    method: 'GET'
  };

  server.inject(options, function(response) {
    var redirectOpts, redirectQueryOpts;
    t.ok(response.statusCode === 302, 'server responds with redirect');

    redirectOpts = url.parse(response.headers.location);

    actual = redirectOpts.host;
    expected = "github.com";
    t.equal(actual, expected, 'redirecturi host is gihub api');

    redirectQueryOpts = querystring.parse(redirectOpts.query);

    actual = redirectQueryOpts.client_id;
    expected = process.env.GITHUB_CLIENT_ID;
    t.equal(actual, expected, 'client token in redirect');


    actual = redirectQueryOpts.redirect_uri;
    expected = process.env.BASE_URL + '/welcome';
    t.equal(actual, expected, 'redirect to welcome page');

    t.end();
  });
});

test('/welcome makes correct requests to ghapi', function(t) {
  var expected, actual;
  var mockCode = 'mockghcode';
  var mockAccessToken = 'mockAccessToken';

  nock('https://github.com')
    .post('/login/oauth/access_token')
    .reply(200, {"access_token":mockAccessToken});

  var options = {
    url: '/welcome?code='+mockCode,
    method: 'GET'
  };

  server.inject(options, function(response) {
    actual = response.statusCode;
    expected = 200;
    t.equal(actual, expected, 'status code ok for gh token request');
    t.end();
  });
});
