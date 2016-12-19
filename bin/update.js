// Load .env (if available)
process.env.VERSION || require('dotenv').config();

const _        = require('lodash');
const chalk    = require('chalk');
const Bluebird = require('bluebird');
const request  = require('request-promise');
const mongoose = require('mongoose');
const utils    = require('../web/message.utils');
const Message  = require('../web/data/schema/message');

const argv = require('yargs').argv;

mongoose.Promise = Bluebird;
mongoose.connect(process.env.MONGODB_URI);

let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    var type = 'NAVADMIN';
    var year = getCurrentYear();
    var savedMessageItems = Message.find({type, year}).exec();
    var scrapedMessageItems = utils.scrapeMessageData(type, year);
    var num = '124';
    Bluebird.all([scrapedMessageItems, savedMessageItems])
        // .tap(() => Message.remove({type, year, num}))
        .then((data) => _.differenceWith(_.head(data), _.last(data), hasSameAttr('id')))
        .tap(_.ary(console.log, 1))
        .finally(() => db.close());
});

function getCurrentYear() {
    var today = new Date();
    // Return current year in YY format
    return Number(String(today.getFullYear()).substring(2));
}

function hasSameAttr(val) {
    return (a, b) => (a[val] === b[val]);
}
