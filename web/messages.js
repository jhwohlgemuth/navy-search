var _       = require('lodash');
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

/**
 * @api {get} /messages/navadmin/:year Get messages data for a given year
 * @apiGroup NAVADMIN
 * @apiVersion 1.0.0
 * @apiDescription Gets a list of message data for a given year
 * @apiSampleRequest /messages/navadmin/16
**/
router.get('/navadmin/:year', function(req, res) {
    var hostname = req.get('host');
    var version = res.app.get('version');
    var year = req.params.year;
    var href = hostname + `/v${version}/messages/navadmin/${year}`;
    var baseUrl = `${hostname}/v${version}/message/`
    res.type('application/vnd.collection+json');
    utils.scrapeMessageData(year).then(function(messageData) {
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
