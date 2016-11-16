var _       = require('lodash');
var bunyan  = require('bunyan');
var express = require('express');
var request = require('request-promise');
var utils   = require('./message.utils');
var router  = express.Router();

var log = bunyan.createLogger({
    name: 'navy-search',
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

function isValid(req, res, next) {
    var val = req.params.id;
    if (val && utils.isValidMessageId(val)) {
        next();
    } else {
        res.json({error: 'Invalid Message ID'})
    }
}

function parseMessageDetails(req, res, next) {
    res.locals.msgDetails = utils.parseMessageid(req.params.id);
    next();
}

router.get('/:id', [isValid, parseMessageDetails], function(req, res) {
    var options = _.pick(res.locals.msgDetails, 'year', 'num');
    utils.getMessage(options).then(
        message => res.send(message)
    );
});

router.get('/navadmin/:year/:number', function(req, res) {
    var options = _.pick(req.params, 'year', 'num');
    utils.getMessage(options).then(
        message => res.send(message)
    );
});


module.exports = router;
