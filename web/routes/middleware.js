'use strict';

const _      = require('lodash');
const bunyan = require('bunyan');
const log = bunyan.createLogger({
    name: 'middleware',
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
const validateValues = require('../lib/message').validateValues;

module.exports = {
    validate,
    setMimeType
};

function validate(req, res, next) {
    const BAD_REQUEST = 400;
    let results = validateValues(_.get(req, 'params', []));
    if (_(results).has('errors')) {
        log.error(results);
        res.status(BAD_REQUEST);
        res.json(results);
    } else {
        next();
    }
}

function setMimeType(name) {
    var mimeTypeLookup = {
        text: 'text/plain',
        javascript: 'application/javascript',
        collection: 'application/vnd.collection+json'
    };
    return function(req, res, next) {
        if (_(mimeTypeLookup).has(name)) {
            res.type(mimeTypeLookup[name]);
            next();
        } else {
            var errorMessage = 'Invalid MIME type';
            log.error(errorMessage);
            res.json(errorMessage);
        }
    };
}
