var _       = require('lodash');
var os      = require('os');
var bunyan  = require('bunyan');
var express = require('express');
var utils   = require('./message.utils');
var router  = express.Router();

var log = bunyan.createLogger({
    name: 'messages',
    streams: [
        {
            stream: process.stdout
        },
        {
            type: 'file',
            path: 'navy-search.log'
        }
    ]
});

function collectionJsonMimeType(req, res, next) {
    res.type('application/vnd.collection+json');
    next();
}

/**
 * @api {get} /messages/NAVADMIN/:year Get messages data for a given year
 * @apiGroup NAVADMIN
 * @apiVersion 1.0.0
 * @apiDescription Gets a list of message data for a given year
 * @apiSampleRequest /messages/NAVADMIN/16
**/
router.get('/navadmin/:year', collectionJsonMimeType, function(req, res) {
    var hostname = 'https://' + req.get('host');
    var version = res.app.get('version');
    var year = req.params.year;
    var href = hostname + `/api/v${version}/messages/navadmin/${year}`;
    var baseUrl = `${hostname}/api/v${version}/message/`;
    utils.scrapeMessageData('NAVADMIN', year).then(function(messageData) {
        var items = messageData.map(function(item) {
            var href = baseUrl + utils.createMessageId(item.type, item.year, item.num);
            var data = _.map(item, function(val, key) {
                var name = key;
                var value = val;
                return {name, value};
            });
            var links = [];
            return {href, data, links};
        });
        return res.json({
            collection: {version, href, items}
        });
    });
});

/**
 * @api {get} /messages/ALNAV/:year Get messages data for a given year
 * @apiGroup ALNAV
 * @apiVersion 1.0.0
 * @apiDescription Gets a list of message data for a given year
 * @apiSampleRequest /messages/ALNAV/16
**/
router.get('/alnav/:year', collectionJsonMimeType, function(req, res) {
    var hostname = req.get('host');
    var version = res.app.get('version');
    var year = req.params.year;
    var href = hostname + `/api/v${version}/messages/alnav/${year}`;
    var baseUrl = `${hostname}/api/v${version}/message/`;
    utils.scrapeMessageData('ALNAV', year).then(function(messageData) {
        var items = messageData.map(function(item) {
            var href = baseUrl + utils.createMessageId(item.type, item.year, item.num);
            var data = _.map(item, function(val, key) {
                var name = key;
                var value = val;
                return {name, value};
            });
            var links = [];
            return {href, data, links};
        });
        return res.json({
            collection: {version, href, items}
        });
    });
});

module.exports = router;
