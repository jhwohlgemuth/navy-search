var Bluebird = require('bluebird');
var mongoose = require('mongoose');
var Message  = require('./schema/message');

mongoose.Promise = Bluebird;
mongoose.connect(process.env.MONGODB_URI);

var db = mongoose.connection;
db.once('open', function() {

});
