const Appointment = require('../models/Appointment');
const Room = require('../models/roomManagement');
const User = require('../models/user')
const Notification = require('../models/notification');
const asyncHandler = require('express-async-handler');


const createAppointment = asyncHandler(async (req, res) => {
    if (Object.keys(req.body).length === 0) throw new Error('Missing input');

    const newAppointment = await Appointment.create({ ...req.body });

    // Lấy ngày tháng năm từ newAppointment.date
    const appointmentDate = new Date(newAppointment.date);
    const formattedDate = appointmentDate.toISOString().split('T')[0];

    const adminUsers = await User.find({ role: 'admin' });
    const notificationTitle = "Đặt lịch xem phòng";
    const notificationContent = `Ngày: ${formattedDate}, Thời gian: ${newAppointment.time}, Thông tin liên hệ: ${newAppointment.contactInfo}`;

    // Tìm room tương ứng trong roomManagementSchema để lấy houseId
    const room = await Room.findById(newAppointment.room);
    if (!room) {
        return res.status(400).json({
            success: false,
            error: 'Room not found',
        });
    }
    const houseId = room.house;

    for (const user of adminUsers) {
        const newNotification = await Notification.create({
            title: notificationTitle,
            content: notificationContent,
            user: [user._id],
            house: houseId,
            room: newAppointment.room,
            appointment: newAppointment._id,
            status: 'pending'
        });
    }

    return res.status(200).json({
        success: newAppointment ? true : false,
        created: newAppointment ? newAppointment : 'Cannot create new Appointment'
    });
});

const getAppointmentOfUser = asyncHandler(async (req, res) => {
    const { uId } = req.params;
    const appointment = await Appointment.find({ user: uId });
    return res.status(200).json({
        success: appointment ? true : false,
        appointments: appointment ? appointment : 'Cannot get all appointment'
    });
});

module.exports = {
    createAppointment,
    getAppointmentOfUser,
};