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
 * @apiParam {string} type NAVADMIN, ALNAV, etc...
 * @apiParam {string} year Two character year (15, 16, etc...)
 * @apiParam {string} num Three character message number (004, 052, 213, etc...)
 * @apiSampleRequest /message
**/
router.get('/', function(req, res) {
    var options = _.pick(req.query, 'type', 'year', 'num');
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
 * @apiSampleRequest /message/NAVADMIN16123
**/
router.get('/:id', [isValid, parseMessageDetails], function(req, res) {
    var options = _.pick(res.locals.msgDetails, 'type', 'year', 'num');
    res.type('text/plain');
    utils.getMessage(options).then(
        message => res.send(message)
    );
});
/**
 * @api {get} /message/NAVADMIN/:year/:number Get message from year and number
 * @apiGroup NAVADMIN
 * @apiVersion 1.0.0
 * @apiDescription Gets a single message based on message year and number
 * @apiSampleRequest /message/NAVADMIN/15/213
**/
router.get('/NAVADMIN/:year/:num', function(req, res) {
    var options = _.pick(req.params, 'year', 'num');
    res.type('text/plain');
    utils.getMessage(_.extend(options, {type: 'NAVADMIN'})).then(
        message => res.send(message)
    );
});
/**
 * @api {get} /message/ALNAV/:year/:number Get message from year and number
 * @apiGroup ALNAV
 * @apiVersion 1.0.0
 * @apiDescription Gets a single message based on message year and number
 * @apiSampleRequest /message/ALNAV/16/042
**/
router.get('/ALNAV/:year/:num', function(req, res) {
    var options = _.pick(req.params, 'year', 'num');
    res.type('text/plain');
    utils.getMessage(_.extend(options, {type: 'ALNAV'})).then(
        message => res.send(message)
    );
});

module.exports = router;
