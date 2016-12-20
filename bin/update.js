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
const attemptRequest = utils.attemptRequest;
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
    Bluebird.all([scrapedItems, savedItems])
        .tap(() => Message.remove({type, year, num: '124'}))
        .tap(() => Message.remove({type, year, num: '125'}))
        .then((data) => _.differenceWith(_.head(data), _.last(data), hasSameAttr('id')))
        .tap(_.unary(console.log))
        .tap(printStartMessage)
        .map(attemptRequest)
        .then((items) => Message.create(items))
        .then(printDoneMessage)
        .catch((err) => {
            console.log('Update ' + chalk.red.bold('FAILED'));
            console.log(err);
        })
        .finally(() => db.close());
});

function getCurrentYear() {
    var today = new Date();
    // Return current year in YY format
    return Number(String(today.getFullYear()).substring(2));
}

function printStartMessage(items) {
    var type = _.get(_.head(items), 'type');
    var numberOfItems = items.length;
    if (numberOfItems > 0) {
        var justOne = (numberOfItems === 1);
        console.log(chalk.cyan(`Updating ${chalk.bold(items.length)} ${chalk.bold(type)} message${justOne ? '' : 's'}...\n`));
    } else {
        console.log(chalk.green(`\nNo new messages\n`));
    }
}

function printDoneMessage(items) {
    if (Array.isArray(items)) {
        var details = ` ~ ${chalk.bold(items.length)} messages added`;
        process.stdout.write(`${chalk.green.bold('COMPLETE')}${details}\n\n`);
    }
}
