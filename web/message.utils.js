var _        = require('lodash');
var lunr     = require('lunr');
var Xray     = require('x-ray');
var Bluebird = require('bluebird');
var mongoose = require('mongoose');
var request  = require('request-promise');
var Message  = require('../web/data/schema/message');

var NPC_DOMAIN = 'http://www.public.navy.mil';

var MSG_TYPE = {
    NAV: 'NAVADMIN',
    ALN: 'ALNAV'
};

const FAIL_TEXT = 'intentionally left blank';

function hasSameAttr(val) {
    return (a, b) => (a[val] === b[val]);
}

function attemptRequest(options, isRetry) {
    let args = _.at(options, 'type', 'year', 'num');
    let item = _.pick(options, 'type', 'year', 'num', 'code', 'url');
    let requestOptions = _.pick(options, 'url');
    let id = _.spread(createMessageId)(args);
    return request(requestOptions)
        .then((text) => _.assign(item, {id, text}))
        .catch(() => _.assign(item, {id, text: FAIL_TEXT}));
}

function isRequestFail(item) {
    return (item.text === FAIL_TEXT);
}

function maybeRequest(item) {
    return isRequestFail(item) ? attemptRequest(item, true) : item;
}

function parseMessageUri(data) {
    var messageId = _.head(_.head(data.split('/').slice(-1)).split('.'));
    var ext = _.last(data.split('.'));
    var code = _.takeWhile(messageId, _.flowRight(isNaN, Number)).join('');
    var codeLength = code.length;
    var year = messageId.substring(codeLength, codeLength + 2);
    var num = messageId.substring(codeLength + 2);
    var type = MSG_TYPE[code];
    var url = `${NPC_DOMAIN}${data}`;
    var id = createMessageId(type, year, num);
    return {id, type, code, year, num, ext, url};
}

function createMessageId(type, year, num) {
    return `${type}${year}${num}`;
}

function parseMessageId(val) {
    var arr = val.split('');
    var type = _.takeWhile(arr, _.flowRight(isNaN, Number))
        .join('')
        .toLowerCase();
    var year = val.substring(type.length, type.length + 2);
    var num = val.substr(-3);
    return {type, year, num};
}

function isValidMessageId(val) {
    var MESSAGE_ID_REGEX = /^[a-z]{5,8}\d{5}$/gmi;
    return MESSAGE_ID_REGEX.test(val);
}

function scrapeMessageData(type, year, options) {
    year = (String(year).length === 4) ? Number(year.substr(-2)) : year;
    var url = `${_.get(options, 'domain', NPC_DOMAIN)}/bupers-npc/reference/messages/${type}S/Pages/${type}20${year}.aspx`;
    return  Bluebird.promisify((new Xray())(url, 'a', [{href: '@href'}]))(url)
        .map(val => val.href)
        .filter(str => /[.]txt$/.test(str))
        .map(str => str.split('mil')[1])
        .map(parseMessageUri);
}

function getMessage(options) {
    var type = _.get(options, 'type', '').toUpperCase();
    var year = _.get(options, 'year');
    var num  = _.get(options, 'num');
    return Message
        .findOne({type, year, num})
        .exec();
}

function searchMessages(searchStrings, options) {
    return searchStrings;
}

module.exports = {
    parse: {
        messageId:  parseMessageId,
        messageUri: parseMessageUri
    },
    createMessageId:   createMessageId,
    isValidMessageId:  isValidMessageId,
    scrapeMessageData: scrapeMessageData,
    getMessage:        getMessage,
    searchMessages:    searchMessages,
    hasSameAttr:       hasSameAttr,
    attemptRequest:    attemptRequest,
    maybeRequest:      maybeRequest,
    isRequestFail:     isRequestFail
};
