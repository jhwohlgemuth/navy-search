var fs         = require('fs-extra');
var path       = require('path');
var Bluebird   = require('bluebird');
var express    = require('express');
var mocha      = require('mocha');
var chai       = require('chai');
var request    = require('supertest');
var proxyquire = require('proxyquire');
var expect     = chai.expect;

function readFile(fileName) {
    var filePath = path.join(__dirname, fileName);
    return fs.readFileSync(filePath);
}

var URL_ROOT = 'http://www.public.navy.mil/bupers-npc/reference/messages/Documents/NAVADMINS/NAV2016/';
var MSG_TYPE = [
    'NAVADMIN',
    'ALNAV'
];
var TEST_NUM = '042';
var TEST_DATA = [
    {
        id: `NAVADMIN16${TEST_NUM}`,
        type: 'NAVADMIN',
        code: 'NAV',
        year: '16',
        num: TEST_NUM,
        ext: 'txt',
        url: `${URL_ROOT}NAV16${TEST_NUM}.txt`
    },
    {
        id: `ALNAV16${TEST_NUM}`,
        type: 'ALNAV',
        code: 'ALN',
        year: '16',
        num: TEST_NUM,
        ext: 'txt',
        url: `${URL_ROOT}ALN16${TEST_NUM}.txt`
    }
];

var stubs = {
    './message.utils': {
        scrapeMessageData: function() {
            return Bluebird.resolve(TEST_DATA);
        },
        getMessage: function() {
            return Bluebird.resolve(readFile('data/NAVADMIN16215.txt'));
        }
    }
};

var message = proxyquire('../web/message', stubs);
var messages = proxyquire('../web/messages', stubs);
var app = express();

var API_ROOT = '127.0.0.1:5984/';
var VERSION  = '1.0';

app.set('version', VERSION);
app.use('/message', message);
app.use('/messages', messages);

MSG_TYPE.forEach(function(type) {
    describe(`GET /api/v${VERSION}/messages/${type}/:year`, function() {
        this.timeout(3000);
        var endpoint = (`/messages/${type}/16`).toLowerCase();
        it('can format scraped messages data', function(done) {
            request(app)
                .get(endpoint)
                .expect(function(res) {
                    var response = res.body;
                    var href = response.collection.href.split(`/v${VERSION}`).slice(1).join('/');
                    expect(response).to.have.property('collection');
                    expect(href).to.equal(endpoint)
                    expect(response.collection.items).to.be.an('array');
                    expect(response.collection.items.length).to.equal(TEST_DATA.length);
                })
                .end(function(err, res) {
                    if (err) {return done(err);}
                    done();
                })
        });
        it('can return Collection+JSON MIME type response', function(done) {
            request(app)
                .get(endpoint)
                .expect(200)
                .expect('Content-Type', 'application/vnd.collection+json; charset=utf-8')
                .end(function(err, res) {
                    if (err) {return done(err);}
                    done();
                });
        });
    });
});
describe(`GET /api/v${VERSION}/message/:id`, function() {
    this.timeout(3000);
    var endpoint = (`/message/NAVADMIN16215`).toLowerCase();
    it('can get message text', function(done) {
        request(app)
            .get(endpoint)
            .expect(200)
            .expect('Content-Type', 'text/plain; charset=utf-8')
            .end(function(err, res) {
                if (err) {return done(err);}
                done();
            });
    });
});
describe(`GET /api/v${VERSION}/message/NAVADMIN/:year/:num`, function() {
    this.timeout(3000);
    var endpoint = (`/message/NAVADMIN/16/215`).toLowerCase();
    it('can get message text', function(done) {
        request(app)
            .get(endpoint)
            .expect(200)
            .expect('Content-Type', 'text/plain; charset=utf-8')
            .end(function(err, res) {
                if (err) {return done(err);}
                done();
            });
    });
});
describe(`GET /api/v${VERSION}/message/ALNAV/:year/:num`, function() {
    this.timeout(3000);
    var endpoint = (`/message/ALNAV/16/042`).toLowerCase();
    it('can get message text', function(done) {
        request(app)
            .get(endpoint)
            .expect(200)
            .expect('Content-Type', 'text/plain; charset=utf-8')
            .end(function(err, res) {
                if (err) {return done(err);}
                done();
            });
    });
});
