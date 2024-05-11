const HoldingDeposit = require('../models/holdingDeposit');
const House = require('../models/house');
const Room = require('../models/roomManagement');
const User = require('../models/user')
const Notification = require('../models/notification')
const asyncHandler = require('express-async-handler');

const createHoldingDeposit = asyncHandler(async (req, res) => {
    if (Object.keys(req.body).length === 0) throw new Error('Missing input');
    const { houseId, roomId} = req.params;
    const house = await House.findById(houseId);
    const room = await Room.findById(roomId);
    if (!house) throw new Error('House not found');
    if (!room) throw new Error('Room not found');

    const newHoldingDeposit = await HoldingDeposit.create({ ...req.body, house: houseId, room: roomId});

    // Gửi thông báo đến người đặt cọc
    const tenantId = req.body.tenant;
    const tenant = await User.findById(tenantId);

    if (tenant) {
        const currentDate = new Date();
        const formattedDate = `${currentDate.getDate()}/${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`;
        const formatExpectedEntryDate = `${newHoldingDeposit.expectedEntryDate.getDate()}/${newHoldingDeposit.expectedEntryDate.getMonth() + 1}/${newHoldingDeposit.expectedEntryDate.getFullYear()}`;

        const notificationContent = `Bạn đã đặt cọc phòng vào ngày ${formattedDate}. Ngày vào ${formatExpectedEntryDate}`;

        await Notification.create({
            title: 'Đặt cọc phòng thành công',
            content: notificationContent,
            user: [tenantId],
            house: houseId,
            room: roomId,
            status: 'approved',
        });
    }

    return res.status(200).json({
        success: newHoldingDeposit ? true : false,
        newHolding: newHoldingDeposit ? newHoldingDeposit : 'Cannot create new Holding Deposit'
    });
});

const getAllHoldingDeposit = asyncHandler(async (req, res) => {
    const holdings = await HoldingDeposit.find();
    return res.status(200).json({
        success: holdings ? true : false,
        holdings: holdings ? holdings : 'Cannot get all Holding Deposit'
    });
});

const updateHoldingDeposit = asyncHandler(async (req, res) => {
    const { hid } = req.params;
    const updatedHolding = await HoldingDeposit.findOneAndUpdate({ _id: hid }, req.body, { new: true });
    return res.status(200).json({
        success: updatedHolding ? true : false,
        updatedHolding: updatedHolding ? updatedHolding : 'Cannot update Holding Deposit'
    });
});


const deleteHoldingDeposit = asyncHandler(async (req, res) => {
    const { hid } = req.params;
    const deletedHolding = await HoldingDeposit.findOneAndDelete({ _id: hid });
    return res.status(200).json({
        success: deletedHolding ? true : false,
        deletedHolding: deletedHolding ? deletedHolding : 'Cannot delete Holding Deposit'
    });
});

module.exports = {
    createHoldingDeposit,
    updateHoldingDeposit,
    getAllHoldingDeposit,
    deleteHoldingDeposit
};