// Load .env (if available)
process.env.VERSION || require('dotenv').config();

const _        = require('lodash');
const chalk    = require('chalk');
const Bluebird = require('bluebird');
const request  = require('request-promise');
const mongoose = require('mongoose');
const utils    = require('../web/message.utils');
const Message  = require('../web/data/schema/message');

const scrapeItems = utils.scrapeMessageData;
const hasSameAttr = utils.hasSameAttr;

const argv = require('yargs').argv;
const VERBOSE = argv.v;

mongoose.Promise = Bluebird;
mongoose.connect(process.env.MONGODB_URI);

let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    var type = 'NAVADMIN';
    var year = getCurrentYear();
    var scrapedItems = scrapeItems(type, year);
    var savedItems = Message.find({type, year}).exec();
    var num = '124';
    Bluebird.all([scrapedItems, savedItems])
        // .tap(() => Message.remove({type, year, num}))
        .then((data) => _.differenceWith(_.head(data), _.last(data), hasSameAttr('id')))
        .tap(_.unary(console.log))
        .finally(() => db.close());
});

function getCurrentYear() {
    var today = new Date();
    // Return current year in YY format
    return Number(String(today.getFullYear()).substring(2));
}
