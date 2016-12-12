var Bluebird = require('bluebird');
var mongoose = require('mongoose');
mongoose.Promise = Bluebird;
mongoose.connect(process.env.MONGODB_URI);

var db = mongoose.connection;
var Message = require('./schemas/message');

var nav16042 = new Message({
    type: 'NAVADMIN',
    year: '16',
    num: '042'
});

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // Message.remove({type: 'NAVADMIN'}).then(function() {
  //     nav16042.save().then(function(msg) {
  //         Message
  //           .find({type: 'NAVADMIN'})
  //           .where('num').equals('042')
  //           .exec(function(err, msg) {
  //               console.log(msg);
  //           });
  //     });
  // });
});
