'use strict';

var mongoose = require('mongoose');

var options = {
    timestamps: true
};

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
        required: true,
        unique: false
    },
    subject: String,
    url: String,
    text: String
}, options);
messageSchema.index({text: 'text'});

module.exports = mongoose.model('Message', messageSchema);
