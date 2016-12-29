/* eslint-disable new-cap */
'use strict';

const _              = require('lodash');
const express        = require('express');
const msglib         = require('../lib/message');
const middleware     = require('./middleware');
const router         = express.Router();
const validate       = middleware.validate;
const setMimeType    = middleware.setMimeType;
const parseMessageId = msglib.parseMessageId;
const getMessage     = msglib.getMessage;

var NO_MESSAGE = 'intentionally left blank';
/**
 * @api {get} /message Get message
 * @apiGroup Message
 * @apiVersion 1.0.0
 * @apiDescription Gets a single message via attribute query
 * @apiParam {string="NAVADMIN", "ALNAV"} type Message type
 * @apiParam {string{2}} year Year in YY format (15, 16, etc...)
 * @apiParam {string{3}} num Message number (004, 052, 213, etc...)
 * @apiExample {json} Example usage:
 * curl -i https://www.navysearch.org/v1.0/message?type=NAVADMIN&year=16&num=042
 * @apiSampleRequest /message
**/
router.get('/', setMimeType('text'), function(req, res) {
    var options = _.pick(req.query, 'type', 'year', 'num');
    getMessage(options).then(
        message => res.send(_.get(message, 'text', NO_MESSAGE))
    );
});
/**
 * @api {get} /message/:id Get message from ID
 * @apiGroup Message
 * @apiVersion 1.0.0
 * @apiDescription Gets a single message based on message ID
 * @apiSampleRequest /message/NAVADMIN16123
**/
router.get('/:id', [validate, setMimeType('text')], function(req, res) {
    var options = parseMessageId(req.params.id);
    getMessage(options).then(
        message => res.send(_.get(message, 'text', NO_MESSAGE))
    );
});
/**
 * @api {get} /message/NAVADMIN/:year/:number Get message from year and number
 * @apiGroup NAVADMIN
 * @apiVersion 1.0.0
 * @apiDescription Gets a single message based on message year and number
 * @apiSampleRequest /message/NAVADMIN/15/213
**/
router.get('/NAVADMIN/:year/:num', [validate, setMimeType('text')], function(req, res) {
    var options = _.pick(req.params, 'year', 'num');
    getMessage(_.extend(options, {type: 'NAVADMIN'})).then(
        message => res.send(_.get(message, 'text', NO_MESSAGE))
    );
});
/**
 * @api {get} /message/ALNAV/:year/:number Get message from year and number
 * @apiGroup ALNAV
 * @apiVersion 1.0.0
 * @apiDescription Gets a single message based on message year and number
 * @apiSampleRequest /message/ALNAV/16/042
**/
router.get('/ALNAV/:year/:num', [validate, setMimeType('text')], function(req, res) {
    var options = _.pick(req.params, 'year', 'num');
    getMessage(_.extend(options, {type: 'ALNAV'})).then(
        message => res.send(_.get(message, 'text', NO_MESSAGE))
    );
});

module.exports = router;
