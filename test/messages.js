var mocha    = require('mocha');
var chai     = require('chai');
var chaiHttp = require('chai-http');
var request  = require('supertest');
var expect   = chai.expect;
chai.use(chaiHttp);

var app = require('../web/message');

var API_ROOT = 'http://localhost:5984/';
var VERSION  = '1.0';

describe(`GET /v${VERSION}/messages/NAVADMIN/:year`, function() {
    var endpoint = `${API_ROOT}v${VERSION}/messages/NAVADMIN/16`;
    it('responds with JSON array', function() {
    });
});
