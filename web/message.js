var _       = require('lodash');
var bunyan  = require('bunyan');
var express = require('express');
var utils   = require('./message.utils');
var router  = express.Router();

var log = bunyan.createLogger({
    name: 'message',
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

/**
 * @api {get} /message/:id Get message from ID
 * @apiGroup Message
 * @apiVersion 1.0.0
 * @apiDescription Gets a single message based on message ID
 * @apiSampleRequest /message/navadmin16123
**/
router.get('/:id', [isValid, parseMessageDetails], function(req, res) {
    var options = _.pick(res.locals.msgDetails, 'year', 'num');
    utils.getMessage(options).then(
        message => res.send(message)
    );
});

/**
 * @api {get} /message/navadmin/:year/:number Get message from year and number
 * @apiGroup Message
 * @apiVersion 1.0.0
 * @apiDescription Gets a single message based on message year and number
 * @apiSampleRequest /message/navadmin/15/213
**/
router.get('/navadmin/:year/:num', function(req, res) {
    var options = _.pick(req.params, 'year', 'num');
    utils.getMessage(options).then(
        message => res.send(message)
    );
});

module.exports = router;
