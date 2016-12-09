require('dotenv').config();
var _        = require('lodash');
var Bluebird = require('bluebird');
var request  = require('request-promise');
var mongoose = require('mongoose');
mongoose.Promise = Bluebird;
mongoose.connect(process.env.MONGODB_URI);

var db = mongoose.connection;
var messageSchema = require('../web/data/schemas/message');
var Message = mongoose.model('Message', messageSchema);

var today = new Date();
var currentYear = String(today.getFullYear()).substring(2);
var previousYear = String(Number(currentYear) - 1);

var MESSAGES_ENDPOINT = 'https://usn.herokuapp.com/api/v1.0/messages/';

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log(currentYear, previousYear);
    var type = 'NAVADMIN';
    var year = currentYear;
    request(`${MESSAGES_ENDPOINT}${type}/${year}`)
        .then(JSON.parse)
        .then(function(data) {
            var requests = _.map(data.collection.items, 'href').slice(0, 1)
                .map(function(href) {return 'https://' + href})
                .map(request);
        });
    db.close();
});
