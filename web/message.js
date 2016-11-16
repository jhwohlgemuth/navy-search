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

function parse(req, res, next) {
    var val = req.params.id;
    var arr = val.split('');
    var type = _.takeWhile(arr, _.flowRight(isNaN, Number))
        .join('')
        .toLowerCase();
    var year = val.substring(type.length, type.length + 2);
    var num = val.substr(-3);
    _.extend(res.locals, {
        type: type,
        year: year,
        num:  num
    });
    console.log(req.params);
    console.log(_.pick(res.locals, 'type', 'year', 'num'));
    next();
}

router.get('/:id', [isValid, parse], function(req, res) {
    res.json({type: 'navadmin'});
});

router.get('/navadmin/:year/:number', function(req, res) {
    var year = req.params.year;
    var num  = req.params.number;
    utils.getMessageData(year)
        .then(data => _.find(data, {num, year}))
        .get('url')
        .then(request)
        .then(message => res.send(message));
});


module.exports = router;
