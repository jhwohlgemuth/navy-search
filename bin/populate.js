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

var argv = require('yargs')
    .default('type', 'NAVADMIN')
    .default('year', '16')
    .array('year')
    .argv;

var type = argv.type;
var year = argv.year;
var opts = argv._;

var db = mongoose.connection;

var CHUNK_SIZE = 200;
var CHUNK_DELAY = 1000;
var FAIL_TEXT = 'intentionally left blank';
var YEARS_OF_MESSAGES = 1;

var isNumberLike = _.flow(Number, _.negate(isNaN));

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
    return isRequestFail(item) ? attemptRequest(item, true) : item;
}

function printStartMessage(items) {
    var type = _(items).flatten().head().type;
    return console.log(chalk.dim(`Started ${type} data populate`));
}

function printDoneMessage(items) {
    process.stdout.write(`${chalk.green.bold('COMPLETE')} (${items.length})\n\n`);
}

function printNumberOfFails(items) {
    var NUMBER_OF_FAILS = items.filter(isRequestFail).length;
    console.log(chalk[(NUMBER_OF_FAILS > 0) ? 'red' : 'dim'](`Retry: ${NUMBER_OF_FAILS}`));
}

function populateMessages(type) {
    var years = _(year).concat(opts)
        .filter(isNumberLike)
        .map(String)
        .uniq().value();
        console.log(argv);
    return Bluebird.all(years.map((year) => Message.remove({type, year})))
        .then(() => Bluebird.all(years.map((year) => utils.scrapeMessageData(type, year))))
        .tap(printStartMessage)
        .reduce((allItems, items) => allItems.concat(items))
        .then((items) => {
            var messageItems = _.uniqWith(items, hasSameAttr('id'));
            var chunks = _.chunk(messageItems, CHUNK_SIZE);
            return Bluebird.all(chunks.map(function(chunk, index) {
                return Bluebird.all(chunk.map((item) => attemptRequest(item)))
                    .delay(CHUNK_DELAY * index)
                    .tap(() => console.log('chunk: ' + (index + 1) + chalk.dim('/' + chunks.length)));
            }));
        })
        .reduce((allItems, items) => allItems.concat(items))
        .tap(printNumberOfFails)
        .map(maybeRequest).tap(printNumberOfFails)
        .map(maybeRequest).tap(printNumberOfFails)
        .map(maybeRequest).tap(printNumberOfFails)
        .map(maybeRequest).tap(printNumberOfFails)
        .then((items) => Message.create(items))
        .then(printDoneMessage)
        .catch(processError);
}

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    Bluebird.resolve()
        .then(() => populateMessages(type))
        .finally(() => db.close());
});
