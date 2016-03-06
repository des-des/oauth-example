var test = require('tape');
var server = require('../lib/server.js')

require('./server.test.js');

test('teardown', function(t) {
  server.stop();
})
