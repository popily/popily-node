'use strict';

require('mocha');

var utils = module.exports = {

  getToken: function() {
    var key = process.env.TEST_TOKEN;
    if(!key)
      throw new Error('No token set, please use: TEST_TOKEN=token_here npm run-script test');
    return key;
  },
  
  getServer: function() {
    var server = process.env.TEST_SERVER;
    if(!server)
      server = 'https://staging.popily.com';
    return server;
  },

  getAddOption: function() {
    var option = process.env.TEST_ADD || null;
    return option;
  }

}
