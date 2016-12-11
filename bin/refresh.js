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
    utils.scrapeMessageData('NAVADMIN', year).then(function(messageData) {
        console.log(messageData);
        db.close();
    });
    // Message.remove({type})
    //     // Get and parse message data
    //     .then(() => request(`${MESSAGES_ENDPOINT}${type}/${year}`))
    //     .then(JSON.parse)
    //     // Format returned data for processing
    //     .then((data) => {
    //         return Bluebird.all(_(data.collection.items)
    //             .map(_.property('data'))
    //             .map(function(data) {
    //                 return _.transform(data, function(result, item) {
    //                     return _.extend(result, {[item.name]: item.value});
    //                 });
    //             })
    //             .map(function(item) {
    //                 return request(item.url).then((text) => {
    //                     item.text = text;
    //                     return item;
    //                 });
    //             })
    //         );
    //     })
    //     // Create and save mongodb models
    //     .then((items) => Message.create(items))
    //     .then(() => process.stdout.write(DONE_MESSAGE))
    //     .catch((err) => {
    //         process.stdout.write(ERROR_MESSAGE);
    //         console.log(err);
    //     })
    //     .finally(() => db.close());
});
