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
    console.log('Started...');
    var type = 'NAVADMIN';
    var year = currentYear;
    request(`${MESSAGES_ENDPOINT}${type}/${year}`)
        .then(JSON.parse)
        .then(function(data) {
            var items = _(data.collection.items)
                .map(_.property('data'))
                .map(function(data) {
                    return _.transform(data, function(result, item) {
                        return _.extend(result, {[item.name]: item.value});
                    });
                })
                .map(function(item, index) {
                    return request(item.url).then(function(txt) {
                        item.text = txt;
                        return item;
                    });
                });
            return Bluebird.all(items);
        })
        .done(function(items) {
            Message.create(items).then(function(data) {
                // db.close();
            })
            .catch(function(err) {
                console.log(err);
                // db.close();
            })
            .finally(function() {db.close();});
        });
});
