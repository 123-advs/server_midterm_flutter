const Chat = require('../models/chat');
const User = require('../models/user');
const asyncHandler = require('express-async-handler');


const createChat = asyncHandler(async (req, res) => {
    const { senderId, recepientId, messageType, messageText } = req.body;

    const user1 = await User.findById(senderId);
    const user2 = await User.findById(recepientId);
    if (!user1 || !user2) {
        res.status(400).json({ error: 'One or both users not found' });
        return;
    }

    const newChat = new Chat({
        senderId,
        recepientId,
        messageType,
        message: messageText,
    });

    await newChat.save();
    res.status(200).json({ message: "Message sent Successfully" });
});

const getChat = asyncHandler(async (req, res) => {
    const { senderId, recepientId } = req.params;

    const chats = await Chat.find({
        $or: [
            { senderId: senderId, recepientId: recepientId },
            { senderId: recepientId, recepientId: senderId },
        ],
    }).sort({ createdAt: 1 });

    res.json(chats);
});

const getLatestChat = asyncHandler(async (req, res) => {
    const { senderId, recepientId } = req.params;

    const latestChat = await Chat.findOne({
        $or: [
            { senderId: senderId, recepientId: recepientId },
            { senderId: recepientId, recepientId: senderId },
        ],
    }).sort({ createdAt: -1 }).limit(1);

    res.json(latestChat);
});


module.exports = {
    createChat,
    getChat,
    getLatestChat
};