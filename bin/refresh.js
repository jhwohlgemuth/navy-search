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

var CHUNK_SIZE = 50;
var CHUNK_DELAY = 10000;

function processError(err) {
    var ERROR_MESSAGE = chalk.red.bold('ERROR') + '\n\n';
    process.stdout.write(ERROR_MESSAGE);
    console.log(err);
}

function getCurrentYear() {
    var today = new Date();
    // Return current year in YY format
    return String(today.getFullYear()).substring(2);
}

function hasSameAttr(val) {
    return function(a, b) {
        return a[val] === b[val];
    }
}

function refreshMessages(type) {
    var currYear = getCurrentYear();
    var prevYear = String(Number(currYear) - 1);
    var years = [currYear];
    return Bluebird.resolve(Message.remove({type}))
        .then(() => {
            return Bluebird.all(years.map((year) => utils.scrapeMessageData(type, year)));
        })
        .tap(() => process.stdout.write(chalk.dim(`Started ${type} data refresh...`)))
        .reduce((allItems, items) => allItems.concat(items))
        .then((items) => {
            var messageItems = _.uniqWith(items, hasSameAttr('id'));
            var chunks = _.chunk(messageItems, CHUNK_SIZE);
            return Bluebird.all(chunks.map(function(chunk, index) {
                return Bluebird.all(chunk.map(function(item) {
                    var options = {
                        url: item.url,
                        // method: 'GET',
                        // simple: false,
                        // headers: {'User-Agent': 'navy-search-request'}
                    };
                    return request(options)
                        .then((text) => {
                            var id = utils.createMessageId(item.type, item.year, item.num);
                            return _.assign(item, {id, text});
                        })
                        .catch((text) => {
                            console.log(text);
                        });
                }))
                .delay(CHUNK_DELAY * index)
                .tap(() => console.log('chunk: ' + index));
            }));
        })
        .reduce((allItems, items) => allItems.concat(items))
        .then((items) => Message.create(items))
        .then((items) => process.stdout.write(`${chalk.green.bold('COMPLETE')} (${items.length})\n\n`))
        .catch(processError);
}

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    Bluebird.resolve()
        .then(() => refreshMessages('NAVADMIN'))
        // .then(() => refreshMessages('ALNAV'))
        .finally(() => db.close());
});
