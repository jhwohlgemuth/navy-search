const Bluebird   = require('bluebird');
const express    = require('express');
const mocha      = require('mocha');
const chai       = require('chai');
const request    = require('supertest');
const proxyquire = require('proxyquire');
const readFile   = require('../web/lib/common').readFile;
const expect     = chai.expect;

const URL_ROOT = 'http://www.public.navy.mil/bupers-npc/reference/messages/Documents/NAVADMINS/NAV2016/';
const API_ROOT = '127.0.0.1:5984/';
const VERSION  = '1.0';
const TEXT_CONTENT_TYPE = 'text/plain; charset=utf-8';
const JSON_CONTENT_TYPE = 'application/json; charset=utf-8';
const MSG_TYPE = [
    'NAVADMIN',
    'ALNAV'
];
const TEST_NUM = '042';
const TEST_SEARCH_RESULTS = [
    {
        foo: 'bar'
    }
];
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
const stubs = {
    '../lib/message': {
        scrapeMessageData: function() {
            return Bluebird.resolve(TEST_DATA);
        },
        getMessage: function() {
            return Bluebird.resolve(readFile('../../test/data/NAVADMIN16215.txt'));
        },
        getMessages: function() {
            return Bluebird.resolve([readFile('../../test/data/NAVADMIN16215.txt')]);
        },
        searchMessages: function() {
            return Bluebird.resolve(TEST_SEARCH_RESULTS);
        }
    }
};

const message = proxyquire('../web/routes/message', stubs);
const messages = proxyquire('../web/routes/messages', stubs);
const app = express();
app.set('version', VERSION);
app.use('/message', message);
app.use('/messages', messages);

MSG_TYPE.forEach(function(type) {
    describe(`GET /api/v${VERSION}/messages/${type}/:year`, function() {
        this.timeout(3000);
        var endpoint = `/messages/${type}/16`;
        it('can format scraped messages data', function(done) {
            get(app, endpoint)
                .expect(function(res) {
                    var response = res.body;
                    var href = response.collection.href.split(`/v${VERSION}`).slice(1).join('/');
                    expect(response).to.have.property('collection');
                    expect(href).to.equal(endpoint.toLowerCase())
                    expect(response.collection.items).to.be.an('array');
                    expect(response.collection.items.length).to.equal(TEST_DATA.length);
                })
                .end(function(err, res) {
                    if (err) {return done(err);}
                    done();
                })
        });
        it('can return Collection+JSON MIME type response', function(done) {
            get(app, endpoint)
                .expect('Content-Type', 'application/vnd.collection+json; charset=utf-8')
                .end(function(err, res) {
                    if (err) {return done(err);}
                    done();
                });
        });
    });
});
describe(`GET /api/v${VERSION}/messages/search`, function() {
    this.timeout(3000);
    var endpoint = `/messages/search?q=foo`;
    it('can get message search results array', function(done) {
        get(app, endpoint)
            .expect('Content-Type', JSON_CONTENT_TYPE)
            .end(function(err, res) {
                if (err) {return done(err);}
                expect(res.body).to.deep.equal(TEST_SEARCH_RESULTS);
                done();
            });
    });
});
describe(`GET /api/v${VERSION}/messages/count`, function() {
    this.timeout(3000);
    var endpoint = `/messages/count`;
    it('can get count for all message types', function(done) {
        get(app, endpoint)
            .expect('Content-Type', JSON_CONTENT_TYPE)
            .end(function(err, res) {
                if (err) {return done(err);}
                done();
            });
    });
});
describe(`GET /api/v${VERSION}/message`, function() {
    this.timeout(3000);
    var endpoint = `/message?type=NAVADMIN&year=16&num=042`;
    it('can get message text', function(done) {
        get(app, endpoint)
            .expect('Content-Type', TEXT_CONTENT_TYPE)
            .end(function(err, res) {
                if (err) {return done(err);}
                done();
            });
    });
});
describe(`GET /api/v${VERSION}/message/:id`, function() {
    this.timeout(3000);
    var endpoint = `/message/NAVADMIN16215`;
    it('can get message text', function(done) {
        get(app, endpoint)
            .expect('Content-Type', TEXT_CONTENT_TYPE)
            .end(function(err, res) {
                if (err) {return done(err);}
                done();
            });
    });
});
describe(`GET /api/v${VERSION}/message/NAVADMIN/:year/:num`, function() {
    this.timeout(3000);
    var endpoint = `/message/NAVADMIN/16/215`;
    it('can get message text', function(done) {
        get(app, endpoint)
            .expect('Content-Type', TEXT_CONTENT_TYPE)
            .end(function(err, res) {
                if (err) {return done(err);}
                done();
            });
    });
});
describe(`GET /api/v${VERSION}/message/ALNAV/:year/:num`, function() {
    this.timeout(3000);
    var endpoint = `/message/ALNAV/16/042`;
    it('can get message text', function(done) {
        get(app, endpoint)
            .expect('Content-Type', TEXT_CONTENT_TYPE)
            .end(function(err, res) {
                if (err) {return done(err);}
                done();
            });
    });
});

function get(app, endpoint) {
    return request(app).get(endpoint.toLowerCase()).expect(200);
}
