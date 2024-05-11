const router = require('express').Router();
const ctrls = require('../controllers/chat');
const { verifyAccessToken } = require('../middlewares/verifyToken');
const uploader = require('../config/cloudinary.config');

// Endpoint để tạo tin nhắn mới
router.post('/', verifyAccessToken, ctrls.createChat);

// Endpoint để lấy tin nhắn giữa hai người dùng
router.get('/:senderId/:recepientId', verifyAccessToken, ctrls.getChat);

// Endpoint để lấy tin nhắn mới nhất giữa hai người dùng
router.get('/latest/:senderId/:recepientId', verifyAccessToken, ctrls.getLatestChat);

module.exports = router;
