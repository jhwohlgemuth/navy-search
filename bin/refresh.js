process.env.VERSION || require('dotenv').config();

var _             = require('lodash');
var chalk         = require('chalk');
var Bluebird      = require('bluebird');
var request       = require('request-promise');
var mongoose      = require('mongoose');
var messageSchema = require('../web/data/schemas/message');
var utils         = require('../web/message.utils');

mongoose.Promise = Bluebird;
mongoose.connect(process.env.MONGODB_URI);

var db = mongoose.connection;
var Message = mongoose.model('Message', messageSchema);

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

function refreshMessages(type, year) {
    var currYear = getCurrentYear();
    var prevYear = String(Number(currYear) - 1);
    return Bluebird.resolve(Message.remove({type}))
        .then(() => {
            return Bluebird.all([
                utils.scrapeMessageData(type, currYear),
                utils.scrapeMessageData(type, prevYear)
            ]);
        })
        .tap(() => process.stdout.write(chalk.dim(`Started ${type} data refresh...`)))
        .reduce((allItems, items) => allItems.concat(items))
        .then((items) => {
            return Bluebird.all(_.uniqWith(items, hasSameAttr('id')).map((item) => {
                return request({uri: item.url, simple: false}).then((text) => {
                    var id = utils.createMessageId(item.type, item.year, item.num);
                    return _.assign(item, {id, text});
                });
            }))
        })
        .then((items) => Message.create(items))
        .then((items) => process.stdout.write(`${chalk.green.bold('COMPLETE')} (${items.length})\n\n`))
        .catch(processError);
}

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    var type = 'NAVADMIN';
    var year = getCurrentYear();
    refreshMessages(type).finally(() => db.close());
});
