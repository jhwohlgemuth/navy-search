var _      = require('lodash');
var mocha  = require('mocha');
var chai   = require('chai');
var utils  = require('../web/lib/message');
var expect = chai.expect;

var TEST_ID = 'NAVADMIN16042';
var TEST_URI = '/bupers-npc/reference/messages/Documents/NAVADMINS/NAV2016/NAV16042.txt';
var TEST_OBJ = {
    type: 'NAVADMIN',
    year: '16',
    num: '042'
};

describe('Message Utilities', function() {
    it('can validate message IDs', function() {
        var isValid = utils.isValidMessageId;
        var VALID_IDS = [
            'NAVADMIN16042',
            'NAVADMIN15132',
            'ALNAV15088',
            'ALNAV16033'
        ];
        var INVALID_IDS = [
            'NAVADMIN201642',  // four-character year
            'NAVADMIN1642',    // two-character num
            'NAVADMIN150T9',   // invalid num
            'NAV15123'         // invalid type
        ];
        VALID_IDS.forEach(function(id) {
            expect(isValid(id)).to.be.true;
        });
        INVALID_IDS.forEach(function(id) {
            expect(isValid(id)).to.be.false;
        });
    });
    it('can parse message IDs', function() {
        var parse = utils.parseMessageId;
        var obj = parse(TEST_ID);
        expect(obj).to.deep.equal({
            type: 'navadmin',
            year: '16',
            num: '042'
        });
    });
    it('can parse message URIs', function() {
        var parse = utils.parseMessageUri;
        var obj = parse(TEST_URI);
        expect(_.pick(obj, 'type', 'year', 'num')).to.deep.equal(TEST_OBJ);
    });
});
