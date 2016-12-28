/* eslint-disable new-cap */
'use strict';

const _                 = require('lodash');
const express           = require('express');
const bunyan            = require('bunyan');
const Bluebird          = require('bluebird');
const msglib            = require('../lib/message');
const middleware        = require('./middleware');
const router            = express.Router();
const validate          = middleware.validate;
const setMimeType       = middleware.setMimeType;
const scrapeMessageData = msglib.scrapeMessageData;
const createMessageId   = msglib.createMessageId;
const getMessages       = msglib.getMessages;
const searchMessages    = msglib.searchMessages;
const log = bunyan.createLogger({
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
    searchMessages(searchStrings)
        .then((results) => res.json(results))
        .catch((err) => log(err));
});

/**
 * @api {get} /messages/count Get count data for all message types
 * @apiGroup Message
 * @apiVersion 1.0.0
 * @apiDescription Gets count data for all message types
 * @apiSampleRequest /messages/count
**/
router.get('/count', function(req, res) {
    const types = ['NAVADMIN', 'ALNAV'];
    Bluebird.all(types.map((type) => getMessages({type})))
        .reduce((allItems, items) => allItems.concat(items))
        .then((data) => _(data).groupBy('type'))
        .then((data) => {
            return _(data).mapValues((messages) => _(messages).groupBy('year'));
        })
        .then((data) => {
            return _(data).mapValues((messages) => _(messages).mapValues(_.property('length')));
        })
        .then((details) => res.json(details));
});

/**
 * @api {get} /messages/NAVADMIN/:year Get messages data for a given year
 * @apiGroup NAVADMIN
 * @apiVersion 1.0.0
 * @apiDescription Gets a list of message data for a given year
 * @apiSampleRequest /messages/NAVADMIN/16
**/
router.get('/navadmin/:year', [validate, setMimeType('collection')], function(req, res) {
    var hostname = 'https://' + req.get('host');
    var version = res.app.get('version');
    var year = req.params.year;
    var href = hostname + `/api/v${version}/messages/navadmin/${year}`;
    var baseUrl = `${hostname}/api/v${version}/message/`;
    scrapeMessageData('NAVADMIN', year).then(function(messageData) {
        var items = messageData.map(function(item) {
            var href = baseUrl + createMessageId(item.type, item.year, item.num);
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
router.get('/alnav/:year', [validate, setMimeType('collection')], function(req, res) {
    var hostname = 'https://' + req.get('host');
    var version = res.app.get('version');
    var year = req.params.year;
    var href = hostname + `/api/v${version}/messages/alnav/${year}`;
    var baseUrl = `${hostname}/api/v${version}/message/`;
    scrapeMessageData('ALNAV', year).then(function(messageData) {
        var items = messageData.map(function(item) {
            var href = baseUrl + createMessageId(item.type, item.year, item.num);
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
