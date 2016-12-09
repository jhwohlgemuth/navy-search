var mongoose = require('mongoose');
var utils   = require('../../message.utils');

var messageSchema = new mongoose.Schema({
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
        unique: true
    },
    url: String,
    text: String
});

messageSchema.methods.createMessageId = function() {
    var id = utils.createMessageId(this.type, this.year, this.num);
};

messageSchema.pre('save', function(next) {
    this.createMessageId();
    next();
});

module.exports = messageSchema;
