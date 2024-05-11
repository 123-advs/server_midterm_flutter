const Contract = require('../models/contract');
const House = require('../models/house');
const Room = require('../models/roomManagement');
const Invoice = require('../models/invoice')
const User = require('../models/user')
const Notification = require('../models/notification')
const asyncHandler = require('express-async-handler');

const createInvoice = asyncHandler(async (req, res) => {
    if (Object.keys(req.body).length === 0) throw new Error('Missing input');
    const { houseId, roomId, serviceId, cId } = req.params;
    const house = await House.findById(houseId);
    const room = await Room.findById(roomId);
    const contract = await Contract.findById(cId);
    if (!house) throw new Error('House not found');
    if (!room) throw new Error('Room not found');
    if (!contract) throw new Error('Contract not found');

    const newInvoice = await Invoice.create({ ...req.body, house: houseId, room: roomId, contract: cId });

    const tenantId = contract.tenant;
    const tenant = await User.findById(tenantId);
    if (tenant) {
        const formatMonthClosing = `${newInvoice.monthClosing.getDate()}/${newInvoice.monthClosing.getMonth() + 1}/${newInvoice.monthClosing.getFullYear()}`;
        const serviceAmount = newInvoice.totalAmount - contract.rentPrice;
        const totalAmount = newInvoice.totalAmount - newInvoice.discount

        const notificationContent = `Hóa đơn tiền phòng sắp tới ngày ${formatMonthClosing}. Tiền phòng: ${contract.rentPrice}, tiền dịch vụ: ${serviceAmount}, giảm giá: ${newInvoice.discount}. Tổng tiền cần thanh toán là: ${totalAmount}`;

        await Notification.create({
            title: 'Thông báo hóa đơn tiền phòng',
            content: notificationContent,
            user: [tenantId],
            house: houseId,
            room: roomId,
            status: 'approved',
        });
    }

    return res.status(200).json({
        success: newInvoice ? true : false,
        createdInvoice: newInvoice ? newInvoice : 'Cannot create new invoice'
    });
});

const getAllInvoice = asyncHandler(async (req, res) => {
    const invoices = await Invoice.find();
    return res.status(200).json({
        success: invoices ? true : false,
        invoices: invoices ? invoices : 'Cannot get All invoice'
    });
});

const deleteInvoice = asyncHandler(async (req, res) => {
    const { iId } = req.params;
    const deletedInvoice = await Invoice.findByIdAndDelete({ _id: iId });
    return res.status(200).json({
        success: deletedInvoice ? true : false,
        deleteInvoice: deletedInvoice ? deletedInvoice : 'Cannot delete Invoice'
    });
});

const updateInvoice = asyncHandler(async (req, res) => {
    const { iId } = req.params;

    let updatedInvoice;

    const existingInvoice = await Invoice.findById(iId);

    if (!existingInvoice) {
        return res.status(404).json({
            success: false,
            message: 'Invoice not found',
        });
    }

    // Kiểm tra nếu `req.body.paid` tồn tại, thì cập nhật lại các trường liên quan
    if (req.body.paid) {
        // Cộng dồn số tiền đã thanh toán (paid)
        const paidIncrement = parseFloat(req.body.paid);
        existingInvoice.paid += paidIncrement;

        // Cập nhật lại số tiền còn lại (remaining)
        existingInvoice.remaining = existingInvoice.totalAmount - existingInvoice.discount - existingInvoice.paid;

        // Nếu có giảm giá (discount), tính lại tổng tiền sau giảm giá
        if (existingInvoice.discount) {
            existingInvoice.afterTotalAmount = existingInvoice.totalAmount - existingInvoice.discount;
        } else {
            existingInvoice.afterTotalAmount = existingInvoice.totalAmount;
        }

        // Lưu lại invoice đã cập nhật
        updatedInvoice = await existingInvoice.save();
    } else {
        // Nếu không có `req.body.paid`, sử dụng findOneAndUpdate để cập nhật
        updatedInvoice = await Invoice.findOneAndUpdate({ _id: iId }, req.body, { new: true });
    }

    return res.status(200).json({
        success: updatedInvoice ? true : false,
        updatedInvoice: updatedInvoice ? updatedInvoice : 'Cannot update Invoice'
    });
});


module.exports = {
    createInvoice,
    getAllInvoice,
    deleteInvoice,
    updateInvoice
};