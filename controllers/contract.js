const Contract = require('../models/contract');
const House = require('../models/house');
const Room = require('../models/roomManagement');
const Service = require('../models/serviceManagement');
const User = require('../models/user')
const Notification = require('../models/notification')
const asyncHandler = require('express-async-handler');

const createContract = asyncHandler(async (req, res) => {
    if (Object.keys(req.body).length === 0) throw new Error('Missing input');
    const { houseId, roomId, serviceId  } = req.params;
    const house = await House.findById(houseId);
    const room = await Room.findById(roomId);
    if (!house) throw new Error('House not found');
    if (!room) throw new Error('Room not found');

    const serviceIdsArray = serviceId.split(',');
    const service = await Service.find({ _id: { $in: serviceIdsArray } });
    if (service.length !== serviceIdsArray.length) {
        throw new Error('Some services were not found');
    }

    const newContract = await Contract.create({ ...req.body, house: houseId, room: roomId, service: serviceIdsArray});

    // Gửi thông báo đến người tạo hợp đồng
    const tenantId = req.body.tenant;
    const tenant = await User.findById(tenantId);

    if (tenant) {
        const formatStartedDate = `${newContract.startDate.getDate()}/${newContract.startDate.getMonth() + 1}/${newContract.startDate.getFullYear()}`;

        const notificationContent = `Bạn đã tạo hợp đồng phòng vào ngày ${formatStartedDate}. Ngày vào ${formatStartedDate}`;

        await Notification.create({
            title: 'Tạo hợp đồng phòng thành công',
            content: notificationContent,
            user: [tenantId],
            house: houseId,
            room: roomId,
            status: 'approved',
        });
    }

    return res.status(200).json({
        success: newContract ? true : false,
        createdContract: newContract ? newContract : 'Cannot create new Contract'
    });
});

const getContract = asyncHandler(async (req, res) => {
    const { cid } = req.params;
    const contract = await Contract.findById(cid);
    return res.status(200).json({
        success: contract ? true : false,
        contractData: contract ? contract : 'Cannot get contract'
    });
});

const getContractOfRoom = asyncHandler(async (req, res) => {
    const { houseId, roomId } = req.params;
    const contracts = await Contract.find({ house: houseId, room: roomId });
    return res.status(200).json({
        success: contracts ? true : false,
        contracts: contracts ? contracts : 'Cannot get all contracts'
    });
});

const getAllContracts = asyncHandler(async (req, res) => {
    const contracts = await Contract.find();
    return res.status(200).json({
        success: contracts ? true : false,
        contracts: contracts ? contracts : 'Cannot get all contracts'
    });
});

const getContractOfHouse = asyncHandler(async (req, res) => {
    const { houseId} = req.params;
    const contracts = await Contract.find({ house: houseId });
    return res.status(200).json({
        success: contracts ? true : false,
        contracts: contracts ? contracts : 'Cannot get all contracts'
    });
});

const updateContract = asyncHandler(async (req, res) => {
    const { cid } = req.params;
    const updatedContract = await Contract.findOneAndUpdate({ _id: cid }, req.body, { new: true });
    return res.status(200).json({
        success: updatedContract ? true : false,
        updatedContract: updatedContract ? updatedContract : 'Cannot update Contract'
    });
});

const deleteContractOfRoom = asyncHandler(async (req, res) => {
    const { houseId, roomId, cid } = req.params;
    const deletedContract = await Contract.findOneAndDelete({ _id: cid, house: houseId, room: roomId });
    return res.status(200).json({
        success: deletedContract ? true : false,
        deletedContract: deletedContract ? deletedContract : 'Cannot delete Contract'
    });
});

const deleteContractOfHouse = asyncHandler(async (req, res) => {
    const { houseId, cid } = req.params;
    const deletedContract = await Contract.findOneAndDelete({ _id: cid, house: houseId });
    return res.status(200).json({
        success: deletedContract ? true : false,
        deletedContract: deletedContract ? deletedContract : 'Cannot delete Contract'
    });
});

const deleteContract = asyncHandler(async (req, res) => {
    const {cid } = req.params;
    const deletedContract = await Contract.findOneAndDelete({ _id: cid });
    return res.status(200).json({
        success: deletedContract ? true : false,
        deletedContract: deletedContract ? deletedContract : 'Cannot delete Contract'
    });
});

module.exports = {
    createContract,
    getContract,
    getContractOfRoom,
    updateContract,
    deleteContractOfRoom,
    getAllContracts,
    getContractOfHouse,
    deleteContractOfHouse,
    deleteContract,
};