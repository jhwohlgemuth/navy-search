// Load .env (if available)
process.env.VERSION || require('dotenv').config();

const _        = require('lodash');
const chalk    = require('chalk');
const Bluebird = require('bluebird');
const request  = require('request-promise');
const mongoose = require('mongoose');
const utils    = require('../web/message.utils');
const Message  = require('../web/data/schema/message');

const argv = require('yargs').argv;

mongoose.Promise = Bluebird;
mongoose.connect(process.env.MONGODB_URI);

let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    Message
        .find({type: 'NAVADMIN'})
        .where('year').equals('16')
        .exec(function(err, res) {
            console.log(res.length);
            db.close();
        });
});
