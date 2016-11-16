var _       = require('lodash');
var bunyan  = require('bunyan');
var express = require('express');
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
    var MESSAGE_ID_REGEX = /^[a-z]{5,8}\d{5}$/gmi;
    var id = req.params.id;
    if (id && MESSAGE_ID_REGEX.test(id)) {
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
    log.info(res.locals.type);
    res.json({type: 'navadmin'});
});

router.get('/navadmin/:year/:number', function(req, res) {
    var year = req.params.year;
    utils.getMessageList(year).then(function(data) {
        res.json(data);
    });
});


module.exports = router;
