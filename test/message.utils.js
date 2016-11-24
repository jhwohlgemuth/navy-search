var _      = require('lodash');
var mocha  = require('mocha');
var chai   = require('chai');
var utils  = require('../web/message.utils');
var expect = chai.expect;

var TEST_URI = '/bupers-npc/reference/messages/Documents/NAVADMINS/NAV2016/NAV16042.txt';
var TEST_OBJ = {
    type: 'NAVADMIN',
    year: '16',
    num: '042'
};

describe('Message Utilities', function() {
    it('can parse message URI', function() {
        var parse = utils.parse.messageUri;
        var obj = parse(TEST_URI);
        expect(_.pick(obj, 'type', 'year', 'num')).to.deep.equal(TEST_OBJ);
    });
});
