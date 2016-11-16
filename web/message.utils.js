var _        = require('lodash');
var lunr     = require('lunr');
var Xray     = require('x-ray');
var Bluebird = require('bluebird');
var request  = require('request-promise');

var NPC_DOMAIN = 'http://www.public.navy.mil';

var MSG_TYPE_DICT = {
    NAV: 'NAVADMIN'
};

function parseMessageUri(data) {
    var messageId = _.head(data.split('/').slice(-1));
    var msgType   = _.takeWhile(messageId, _.flowRight(isNaN, Number)).join('');
    var msgYear   = _.head(messageId.split('.')).substring(msgType.length, msgType.length + 2);
    var msgNumber = _.head(messageId.split('.')).substring(msgType.length + 2);
    var extension = _.last(data.split('.'));
    return {
        type: msgType,
        year: msgYear,
        num: msgNumber,
        ext: extension,
        url: NPC_DOMAIN + data,
        id: MSG_TYPE_DICT[msgType] + msgYear + msgNumber
    };
}

function getMessageList(year, domain) {
    year = (String(year).length === 4) ? Number(year.substr(-2)) : year;
    var npc = domain || NPC_DOMAIN;
    var url = `${npc}/bupers-npc/reference/messages/NAVADMINS/Pages/NAVADMIN20${year}.aspx`;
    return  Bluebird.promisify((new Xray())(url, 'a', [{href: '@href'}]))(url)
        .map(val => val.href)
        .filter(str => /[.]txt$/.test(str))
        .map(str => str.split('mil')[1])
        .map(parseMessageUri);
}

module.exports = {
    getMessageList: getMessageList
};
