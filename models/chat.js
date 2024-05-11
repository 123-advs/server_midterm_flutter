const mongoose = require('mongoose');

var chatSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
    },
    recepientId: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
    },
    messageType: {
        type: String,
        enum: ["text", "image"],
    },
    message: String,
}, {
    timestamps: true
});

//Export the model
module.exports = mongoose.model('Chat', chatSchema);