// Load .env (if available)
process.env.VERSION || require('dotenv').config();

const _              = require('lodash');
const chalk          = require('chalk');
const Bluebird       = require('bluebird');
const mongoose       = require('mongoose');
const Message        = require('../web/data/schema/message');
const msglib         = require('../web/lib/message');
const hasSameAttr    = require('../web/lib/common').hasSameAttr;
const scrapeItems    = msglib.scrapeMessageData;
const attemptRequest = msglib.attemptRequest;

const argv = require('yargs')
    .default('type', 'NAVADMIN')
    .argv;
const VERBOSE = argv.v;
const type = argv.type;

mongoose.Promise = Bluebird;
mongoose.connect(process.env.MONGODB_URI);

let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    var year = getCurrentYear();
    var scrapedItems = scrapeItems(type, year);
    var savedItems = Message.find({type, year}).exec();
    Bluebird.all([scrapedItems, savedItems])
        .then((data) => _.differenceWith(_.head(data), _.last(data), hasSameAttr('id')))
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
        console.log(chalk.cyan(`Updating ${chalk.bold(numberOfItems)} ${chalk.bold(type)} message${justOne ? '' : 's'}...\n`));
        VERBOSE && console.log(items);
    } else {
        console.log(chalk.green(`No new messages\n`));
    }
}

function printDoneMessage(items) {
    if (Array.isArray(items)) {
        var updatedItemsNumStr = items.slice(0)
            .map(_.property('num'))
            .sort((a, b) => (Number(a) > Number(b)))
            .join(', ');
        var details = ` ~ ${chalk.bold(items.length)} messages added (${updatedItemsNumStr})`;
        process.stdout.write(`${chalk.green.bold('COMPLETE')}${details}\n\n`);
    }
}
