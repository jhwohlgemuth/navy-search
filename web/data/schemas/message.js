var mongoose = require('mongoose');
var utils   = require('../../message.utils');

var messageSchema = new mongoose.Schema({
    id: {
        type: String,
        unique: true
    },
    type: {
        type: String,
        required: true
    },
    code: String,
    year: {
        type: String,
        required: true
    },
    num: {
        type: String,
        required: true
    },
    url: String,
    text: String
});

module.exports = messageSchema;
