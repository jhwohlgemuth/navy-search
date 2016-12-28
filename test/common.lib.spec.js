const mocha  = require('mocha');
const chai   = require('chai');
const common = require('../web/lib/common');
const expect = chai.expect;

const hasSameAttr = common.hasSameAttr;
const uniqWithAttr = common.uniqWithAttr;

const a = {
    foo: 'foo',
    bar: 'bar'
};
const b = {
    foo: 'foo',
    bar: 'baz'
};
const c = {
    foo: 'not foo'
}

describe('Common Utilities Library', function() {
    it('can compare the attributes of two objects', function() {
        const hasSameFoo = hasSameAttr('foo');
        const hasSameBar = hasSameAttr('bar');
        expect(hasSameFoo(a, b)).to.be.true;
        expect(hasSameBar(a, b)).not.to.be.true;
        expect(hasSameFoo(a, c)).not.to.be.true;
    });
    it('can create unique collections based on attribute values', function() {
        const arr = [a, b, c];
        expect(uniqWithAttr(arr, 'foo')).to.deep.equal([a, c]);
        expect(uniqWithAttr(arr, 'bar')).to.deep.equal([a, b, c]);
    });
});
