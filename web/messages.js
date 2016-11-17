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

router.get('/navadmin/:year', function(req, res) {
    var year = req.params.year;
    utils.scrapeMessageData(year).then(
        data => res.send(data)
    );
});

module.exports = router;
