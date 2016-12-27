const fs         = require('fs-extra');
const path       = require('path');
const Bluebird   = require('bluebird');
const express    = require('express');
const mocha      = require('mocha');
const chai       = require('chai');
const request    = require('supertest');
const proxyquire = require('proxyquire');
const expect     = chai.expect;

const URL_ROOT = 'http://www.public.navy.mil/bupers-npc/reference/messages/Documents/NAVADMINS/NAV2016/';
const MSG_TYPE = [
    'NAVADMIN',
    'ALNAV'
];
const TEST_NUM = '042';
const TEST_DATA = [
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
    '../lib/message': {
        scrapeMessageData: function() {
            return Bluebird.resolve(TEST_DATA);
        },
        getMessage: function() {
            return Bluebird.resolve(readFile('data/NAVADMIN16215.txt'));
        }
    }
};

var message = proxyquire('../web/routes/message', stubs);
var messages = proxyquire('../web/routes/messages', stubs);
var app = express();

var API_ROOT = '127.0.0.1:5984/';
var VERSION  = '1.0';

function readFile(fileName) {
    var filePath = path.join(__dirname, fileName);
    return fs.readFileSync(filePath);
}

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
