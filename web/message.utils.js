var _        = require('lodash');
var lunr     = require('lunr');
var Xray     = require('x-ray');
var Bluebird = require('bluebird');

var NPC_DOMAIN = 'http://www.public.navy.mil';

var MSG_TYPE_DICT = {
    NAV: 'NAVADMIN'
};

function parseMessageUri(data) {
    var messageId  = _.head(_.head(data.split('/').slice(-1)).split('.'));
    var extension  = _.last(data.split('.'));
    var msgType    = _.takeWhile(messageId, _.flowRight(isNaN, Number)).join('');
    var typeLength = msgType.length;
    var msgYear    = messageId.substring(typeLength, typeLength + 2);
    var msgNumber  = messageId.substring(typeLength + 2);
    return {
        type: msgType,
        year: msgYear,
        num:  msgNumber,
        ext:  extension,
        url:  `${NPC_DOMAIN}${data}`,
        id:   createMessageId(MSG_TYPE_DICT[msgType], msgYear, msgNumber)
    };
}

function createMessageId(type, year, num) {
    return `${type}${year}${num}`;
}

function parseMessageid(val) {
    var arr = val.split('');
    var type = _.takeWhile(arr, _.flowRight(isNaN, Number))
        .join('')
        .toLowerCase();
    var year = val.substring(type.length, type.length + 2);
    var num = val.substr(-3);
}

function isValidMessageId(val) {
    var MESSAGE_ID_REGEX = /^[a-z]{5,8}\d{5}$/gmi;
    return MESSAGE_ID_REGEX.test(val);
}

function getMessageData(year, domain) {
    year = (String(year).length === 4) ? Number(year.substr(-2)) : year;
    var url = `${domain || NPC_DOMAIN}/bupers-npc/reference/messages/NAVADMINS/Pages/NAVADMIN20${year}.aspx`;
    return  Bluebird.promisify((new Xray())(url, 'a', [{href: '@href'}]))(url)
        .map(val => val.href)
        .filter(str => /[.]txt$/.test(str))
        .map(str => str.split('mil')[1])
        .map(parseMessageUri);
}

module.exports = {
    createMessageId:  createMessageId,
    parseMessageid:   parseMessageid,
    isValidMessageId: isValidMessageId,
    getMessageData:   getMessageData
};
