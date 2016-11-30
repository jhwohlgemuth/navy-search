var express  = require('express');
var mocha    = require('mocha');
var chai     = require('chai');
var request  = require('supertest');
var expect   = chai.expect;

var message = require('../web/message');
var messages = require('../web/messages');
var app = express();

var API_ROOT = '127.0.0.1:5984/';
var VERSION  = '1.0';

app.set('version', VERSION);
app.use('/message', message);
app.use('/messages', messages);

xdescribe(`GET /v${VERSION}/messages/NAVADMIN/:year`, function() {
    this.timeout(3000);
    var endpoint = `/messages/navadmin/16`;
    it('can return Collection+JSON MIME type response', function(done) {
        request(app)
            .get(endpoint)
            .expect(200)
            .expect(function(data) {
                var response = data.res.body;
                var href = '/' + response.collection.href.split('/').slice(2).join('/');
                expect(response).to.have.property('collection');
                expect(href).to.equal(endpoint)
                expect(response.collection.items).to.be.an('array');
            })
            .end(function(err, res) {
                if (err) {return done(err);}
                done();
            });
    });
});
