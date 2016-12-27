/* eslint-disable new-cap */
'use strict';

var _        = require('lodash');
var bunyan   = require('bunyan');
var express  = require('express');
var Bluebird = require('bluebird');
var utils    = require('../message.utils');
var router   = express.Router();

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
 * @api {get} /messages/search Search messages
 * @apiGroup Message
 * @apiVersion 1.0.0
 * @apiDescription Search messages
 * @apiParam {string} q String to search for
 * @apiExample {json} Search for messages containing "PRT":
 * curl -i https://api.navysearch.org/v1.0/messages/search?q=PRT
 * @apiSampleRequest /messages/search
**/
router.get('/search', function(req, res) {
    var searchStrings = _.get(req, 'query.q', '')
        .split(',')
        .map(_.trim);
    utils.searchMessages(searchStrings)
        .then((results) => res.json(results))
        .catch((err) => log(err));
});

/**
 * @api {get} /messages/summary Get summary data for all message types
 * @apiGroup Message
 * @apiVersion 1.0.0
 * @apiDescription Gets summary data for all message types
 * @apiSampleRequest /messages/summary
**/
router.get('/summary', function(req, res) {
    const types = ['NAVADMIN', 'ALNAV'];
    const type = types[0];
    console.log(type)
    Bluebird.all(types.map((type) => utils.getMessages({type})))
        .reduce((allItems, items) => allItems.concat(items))
        .then((results) => res.json(results.length))
});

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
        items = _.uniqWith(items, function(a, b) {return a.href === b.href;});
        return res.json({
            collection: {version, href, items}
        });
    })
    .catch((err) => log(err));
});

/**
 * @api {get} /messages/ALNAV/:year Get messages data for a given year
 * @apiGroup ALNAV
 * @apiVersion 1.0.0
 * @apiDescription Gets a list of message data for a given year
 * @apiSampleRequest /messages/ALNAV/16
**/
router.get('/alnav/:year', collectionJsonMimeType, function(req, res) {
    var hostname = 'https://' + req.get('host');
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
        items = _.uniqWith(items, function(a, b) {return a.href === b.href;});
        return res.json({
            collection: {version, href, items}
        });
    })
    .catch((err) => log(err));
});

module.exports = router;
