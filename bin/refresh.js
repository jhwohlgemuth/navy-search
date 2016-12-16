process.env.VERSION || require('dotenv').config();

var _        = require('lodash');
var chalk    = require('chalk');
var Bluebird = require('bluebird');
var request  = require('request-promise');
var mongoose = require('mongoose');
var utils    = require('../web/message.utils');
var Message  = require('../web/data/schemas/message');

mongoose.Promise = Bluebird;
mongoose.connect(process.env.MONGODB_URI);

var db = mongoose.connection;

var CHUNK_SIZE = 100;
var CHUNK_DELAY = 500;
var RETRY_TIMES = 3;
var FAIL_TEXT = 'intentionally left blank';
var YEARS_OF_MESSAGES = 1;

function processError(err) {
    var ERROR_MESSAGE = chalk.red.bold('ERROR') + '\n\n';
    process.stdout.write(ERROR_MESSAGE);
    console.log(err);
}

function getCurrentYear() {
    var today = new Date();
    // Return current year in YY format
    return Number(String(today.getFullYear()).substring(2));
}

function hasSameAttr(val) {
    return function(a, b) {
        return a[val] === b[val];
    }
}

function attemptRequest(options, isRetry) {
    var args = _.at(options, 'type', 'year', 'num');
    var item = _.pick(options, 'type', 'year', 'num', 'code', 'url');
    var requestOptions = _.pick(options, 'url');
    var id = _.spread(utils.createMessageId)(args);
    return request(requestOptions)
        .then((text) => _.assign(item, {id, text}))
        .catch(() => _.assign(item, {id, text: FAIL_TEXT}));
}

function isRequestFail(item) {
    return (item.text === FAIL_TEXT);
}

function maybeRequest(item) {
    return isRequestFail(item) ? item : attemptRequest(item, true);
}

function populateMessages(type) {
    var currYear = getCurrentYear();
    var years = _.range(currYear, currYear - YEARS_OF_MESSAGES);
    return Bluebird.resolve(Message.remove({type}))
        .then(() => {
            return Bluebird.all(years.map((year) => utils.scrapeMessageData(type, year)));
        })
        .tap(() => console.log(chalk.dim(`Started ${type} data populate`)))
        .reduce((allItems, items) => allItems.concat(items))
        .then((items) => {
            var messageItems = _.uniqWith(items, hasSameAttr('id'));
            var chunks = _.chunk(messageItems, CHUNK_SIZE);
            return Bluebird.all(chunks.map(function(chunk, index) {
                return Bluebird.all(chunk.map((item) => attemptRequest(item)))
                    .delay(CHUNK_DELAY * index)
                    .tap(() => console.log('chunk: ' + index + chalk.dim('/' + chunks.length)));
            }));
        })
        .reduce((allItems, items) => allItems.concat(items))
        .map(maybeRequest)
        .map(maybeRequest)
        .map(maybeRequest)
        .then((items) => Message.create(items))
        .then((items) => process.stdout.write(`${chalk.green.bold('COMPLETE')} (${items.length})\n\n`))
        .catch(processError);
}

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    Bluebird.resolve()
        .then(() => populateMessages('NAVADMIN'))
        // .then(() => populateMessages('ALNAV'))
        .finally(() => db.close());
});
