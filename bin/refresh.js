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

var START_MESSAGE = chalk.dim('Started data refresh...');
var DONE_MESSAGE = chalk.green.bold('COMPLETE');
var ERROR_MESSAGE = chalk.red.bold('ERROR') + '\n\n';

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

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    process.stdout.write(START_MESSAGE);
    var type = 'NAVADMIN';
    var year = getCurrentYear();
    Message.remove({type})
        .then(() => utils.scrapeMessageData(type, year))
        .then((items) => {
            return Bluebird.all(_.uniqWith(items, hasSameAttr('num')).map((item) => {
                var options = {
                    uri: item.url,
                    headers: {'User-Agent': 'navy-search-message-request'},
                    simple: false
                };
                return request(options).then((text) => _.assign(item, {text}));
            }));
        })
        .then((items) => Message.create(items))
        .then((items) => process.stdout.write(`${DONE_MESSAGE} (${items.length})\n\n`))
        .catch((err) => {
            process.stdout.write(ERROR_MESSAGE);
            console.log(err);
        })
        .finally(() => db.close());
});
