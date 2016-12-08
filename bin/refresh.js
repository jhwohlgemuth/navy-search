require('dotenv').config();
var Bluebird = require('bluebird');
var mongoose = require('mongoose');
mongoose.Promise = Bluebird;
mongoose.connect(process.env.MONGODB_URI);

var db = mongoose.connection;
// var messageSchema = require('../web/data/schemas/message');
// var Message = mongoose.model('Message', messageSchema);

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log('Boot!');
    db.close();
});
