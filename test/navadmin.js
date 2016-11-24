var mocha   = require('mocha');
var chai    = require('chai');
var request = require('request-promise');
var expect  = chai.expect;

var API_ROOT = 'http://localhost:5984/';
var VERSION  = 'v1';

xdescribe('GET /v1/messages/:year', function() {
    var endpoint = `${API_ROOT}${VERSION}/messages/navadmin/16`;
    it('responds with JSON array', function() {

    });
});
