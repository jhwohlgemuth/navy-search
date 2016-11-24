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
    res.locals.msgDetails = utils.parse.messageId(req.params.id);
    next();
}
/**
 * @api {get} /message Get message
 * @apiGroup Message
 * @apiVersion 1.0.0
 * @apiDescription Gets a single message via attribute query
 * @apiParam {string} type NAV (NAVADMIN) or ALN (ALNAV)
 * @apiParam {string} year Two character year (15, 16, etc...)
 * @apiParam {string} num Three character message number (004, 052, 213, etc...)
 * @apiSampleRequest /message
**/
router.get('/', function(req, res) {
    var options = _.pick(req.query, 'year', 'num');
    res.type('text/plain');
    utils.getMessage(options).then(
        message => res.send(message)
    );
});
/**
 * @api {get} /message/:id Get message from ID
 * @apiGroup Message
 * @apiVersion 1.0.0
 * @apiDescription Gets a single message based on message ID
 * @apiSampleRequest /message/navadmin16123
**/
router.get('/:id', [isValid, parseMessageDetails], function(req, res) {
    var options = _.pick(res.locals.msgDetails, 'year', 'num');
    res.type('text/plain');
    utils.getMessage(options).then(
        message => res.send(message)
    );
});
/**
 * @api {get} /message/navadmin/:year/:number Get message from year and number
 * @apiGroup NAVADMIN
 * @apiVersion 1.0.0
 * @apiDescription Gets a single message based on message year and number
 * @apiSampleRequest /message/navadmin/15/213
**/
router.get('/navadmin/:year/:num', function(req, res) {
    var options = _.pick(req.params, 'year', 'num');
    res.type('text/plain');
    utils.getMessage(options).then(
        message => res.send(message)
    );
});

module.exports = router;
