var express  = require('express');
var mocha    = require('mocha');
var chai     = require('chai');
var request  = require('supertest');
var expect   = chai.expect;
chai.use(chaiHttp);

var router = require('../web/message');
var app = express();
app.use('/', router);

var API_ROOT = 'http://localhost:5984/';
var VERSION  = '1.0';

describe(`GET /v${VERSION}/messages/NAVADMIN/:year`, function() {
    var endpoint = `${API_ROOT}v${VERSION}/messages/NAVADMIN/16`;
    it('responds with JSON array', function(done) {
        request(app)
            .get('/NAVADMIN16042')
            .expect(200)
            .end(function(err, res) {
                if (err) {return done(err);}
                done();
            });
    });
});
