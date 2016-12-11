process.env.VERSION || require('dotenv').config();

var _             = require('lodash');
var chalk         = require('chalk');
var Bluebird      = require('bluebird');
var request       = require('request-promise');
var mongoose      = require('mongoose');
var messageSchema = require('../web/data/schemas/message');
var utils         = require('../web/message.utils');

function hasSameAttr(val) {
    return function(a, b) {
        return a[val] === b[val];
    }
}

mongoose.Promise = Bluebird;
mongoose.connect(process.env.MONGODB_URI);
var db = mongoose.connection;
var Message = mongoose.model('Message', messageSchema);

var today = new Date();
var currentYear = String(today.getFullYear()).substring(2);
var previousYear = String(Number(currentYear) - 1);

var MESSAGES_ENDPOINT = 'https://usn.herokuapp.com/api/v1.0/messages/';

var START_MESSAGE = chalk.dim('Started data refresh...');
var DONE_MESSAGE = chalk.green.bold('COMPLETE') + '\n\n';
var ERROR_MESSAGE = chalk.red.bold('ERROR') + '\n\n';

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    process.stdout.write(START_MESSAGE);
    var type = 'NAVADMIN';
    var year = currentYear;
    var url = 'http://www.public.navy.mil/bupers-npc/reference/messages/Documents/NAVADMINS/NAV2016/NAV16001.txt';
    // request({
    //     uri: url,
    //     headers: {'User-Agent': 'Request-Promise'}
    // }).then(function(txt) {
    //     console.log(txt);
    //     db.close();
    // });
    Message.remove({type})
        .then(() => utils.scrapeMessageData('NAVADMIN', year))
        .then((items) => {
            return Bluebird.all(_.uniqWith(items, hasSameAttr('num')).map((item) => {
                var options = {
                    uri: item.url,
                    headers: {'User-Agent': 'Request-Promise'},
                    simple: false
                };
                return request(options).then((text) => {
                    item.text = text;
                    return item;
                });
            }));
        })
        .then((items) => Message.create(items))
        .then((items) => console.log(items.length))
        .then(() => process.stdout.write(DONE_MESSAGE))
        .catch((err) => {
            process.stdout.write(ERROR_MESSAGE);
            console.log(err);
        })
        .finally(() => db.close());
});
