var mongoose = require('mongoose');

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
    url: String,
    text: String
});

module.exports = mongoose.model('Message', messageSchema);
