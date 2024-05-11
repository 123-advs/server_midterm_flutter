const Notification = require('../models/notification');
const House = require('../models/house');
const Room = require('../models/roomManagement');
const User = require('../models/user')
const Appointment = require('../models/Appointment');
const asyncHandler = require('express-async-handler');

const createNotification = asyncHandler(async (req, res) => {
    if (Object.keys(req.body).length === 0) throw new Error('Missing input');
    const { houseId, roomId } = req.params;
    const house = await House.findById(houseId);
    const room = await Room.findById(roomId);

    const { uId } = req.params;
    const uIdsArray = uId.split(',');

    const users = await User.find({ _id: { $in: uIdsArray } });

    if (users.length !== uIdsArray.length) {
        throw new Error('Some users were not found');
    }

    const newNotification = await Notification.create({ ...req.body, houseId: house, roomId: room, user: uIdsArray });

    return res.status(200).json({
        success: newNotification ? true : false,
        created: newNotification ? newNotification : 'Cannot create new Notification'
    });
});

const getNotificationOfUser = asyncHandler(async (req, res) => {
    const { uId } = req.params;
    const notification = await Notification.find({ user: uId });
    return res.status(200).json({
        success: notification ? true : false,
        notifications: notification ? notification : 'Cannot get all notification'
    });
});

const confirmNotificationStatus = asyncHandler(async (req, res) => {
    const { notificationId } = req.params;
    const { status } = req.body;

    if (!status || !['approved', 'rejected'].includes(status)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid status',
        });
    }

    const notification = await Notification.findByIdAndUpdate(notificationId, { status }, { new: true });

    if (!notification) {
        return res.status(404).json({
            success: false,
            error: 'Notification not found',
        });
    }

    const appointment = await Appointment.findByIdAndUpdate(notification.appointment, { status }, { new: true });

    // Kiểm tra và tạo thông báo đến người dùng nếu là admin và trạng thái là 'approved' hoặc 'rejected'
    if (appointment && status === 'approved' || status === 'rejected') {
        await createNotificationToUser(notification, appointment, status);
    }

    return res.status(200).json({
        success: true,
        notification,
        appointment,
    });
});

const createNotificationToUser = async (notification, appointment, status) => {
    const user = await User.findById(appointment.user);

    if (user) {
        let notificationContent = '';

        if (status === 'approved') {
            notificationContent = `Cuộc hẹn của bạn đã được chấp nhận. ${notification.content}`;
        } else if (status === 'rejected') {
            notificationContent = `Cuộc hẹn của bạn đã bị từ chối. ${notification.content}`;
        }

        await Notification.create({
            title: 'Thông báo cuộc hẹn',
            content: notificationContent,
            user: [user._id],
            house: notification.house,
            room: appointment.room,
            appointment: appointment._id,
            status: status,
        });
    }
};

module.exports = {
    createNotification,
    getNotificationOfUser,
    confirmNotificationStatus
};