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
    var year = req.params.year;
    utils.scrapeMessageData(year).then(
        data => res.json(data)
    );
});

module.exports = router;
