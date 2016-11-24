var _        = require('lodash');
var lunr     = require('lunr');
var Xray     = require('x-ray');
var Bluebird = require('bluebird');
var request  = require('request-promise');

var NPC_DOMAIN = 'http://www.public.navy.mil';

var MSG_TYPE = {
    NAV: 'NAVADMIN',
    ALN: 'ALNAV'
};

function parseMessageUri(data) {
    var messageId  = _.head(_.head(data.split('/').slice(-1)).split('.'));
    var ext  = _.last(data.split('.'));
    var code    = _.takeWhile(messageId, _.flowRight(isNaN, Number)).join('');
    var codeLength = code.length;
    var year    = messageId.substring(codeLength, codeLength + 2);
    var num  = messageId.substring(codeLength + 2);
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

function scrapeMessageData(year, domain) {
    year = (String(year).length === 4) ? Number(year.substr(-2)) : year;
    var url = `${domain || NPC_DOMAIN}/bupers-npc/reference/messages/NAVADMINS/Pages/NAVADMIN20${year}.aspx`;
    return  Bluebird.promisify((new Xray())(url, 'a', [{href: '@href'}]))(url)
        .map(val => val.href)
        .filter(str => /[.]txt$/.test(str))
        .map(str => str.split('mil')[1])
        .map(parseMessageUri);
}

function getMessage(options) {
    var year = _.get(options, 'year', '16');
    return scrapeMessageData(year)
        .then(data => _.find(data, _.pick(options, 'num', 'year')))
        .get('url')
        .then(request);
}

module.exports = {
    createMessageId:   createMessageId,
    parseMessageId:    parseMessageId,
    isValidMessageId:  isValidMessageId,
    scrapeMessageData: scrapeMessageData,
    getMessage:        getMessage
};
