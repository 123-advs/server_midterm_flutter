const Utilities = require('../models/utilities');
const House = require('../models/house');
const Room = require('../models/roomManagement');
const User = require('../models/user')
const Contract = require('../models/contract')
const asyncHandler = require('express-async-handler');

const createUtilities = asyncHandler(async (req, res) => {
    if (Object.keys(req.body).length === 0) throw new Error('Missing input');
    const { houseId, roomId, cId } = req.params;
    const house = await House.findById(houseId);
    const room = await Room.findById(roomId);
    const contract = await Contract.findById(cId);
    if (!house) throw new Error('House not found');
    if (!room) throw new Error('Room not found');
    if (!contract) throw new Error('Contract not found');

    const newUtilities = await Utilities.create({ ...req.body, house: houseId, room: roomId, contract: cId});
    return res.status(200).json({
        success: newUtilities ? true : false,
        createdUtilities: newUtilities ? newUtilities : 'Cannot create new Utilities'
    });
});

// const getUtilities = asyncHandler(async (req, res) => {
//     const { utId, uId } = req.params;
//     const utilities = await Utilities.find({ _id: utId, user: uId });
//     return res.status(200).json({
//         success: utilities ? true : false,
//         utilitiesData: utilities ? utilities : 'Cannot get utilities'
//     });
// });

const getUtilitiesOfHouse = asyncHandler(async (req, res) => {
    const { houseId} = req.params;
    const utilities = await Utilities.find({ house: houseId });
    return res.status(200).json({
        success: utilities ? true : false,
        utilities: utilities ? utilities : 'Cannot get all utilities'
    });
});

const getUtilitiesOfRoom = asyncHandler(async (req, res) => {
    const { houseId, roomId } = req.params;
    const utilities = await Utilities.find({ house: houseId, room: roomId });
    return res.status(200).json({
        success: utilities ? true : false,
        utilities: utilities ? utilities : 'Cannot get all utilities'
    });
});

const  getAllUtilities= asyncHandler(async (req, res) => {
    const utilities = await Utilities.find();
    return res.status(200).json({
        success: utilities ? true : false,
        utilities: utilities ? utilities : 'Cannot get all utilities'
    });
});

const updateUtilities = asyncHandler(async (req, res) => {
    const { utId } = req.params;
    const updatedUtilities = await Utilities.findOneAndUpdate({ _id: utId }, req.body, { new: true });
    return res.status(200).json({
        success: updatedUtilities ? true : false,
        updatedUtilities: updatedUtilities ? updatedUtilities : 'Cannot update Utilities'
    });
});

const deleteUtilitiesOfRoom = asyncHandler(async (req, res) => {
    const { houseId, roomId, utId} = req.params;
    const deletedUtilities = await Utilities.findOneAndDelete({ _id: utId, house: houseId, room: roomId });
    return res.status(200).json({
        success: deletedUtilities ? true : false,
        deletedUtilities: deletedUtilities ? deletedUtilities : 'Cannot delete Utilities'
    });
});

const deleteUtilitiesOfHouse = asyncHandler(async (req, res) => {
    const { houseId, utId } = req.params;
    const deletedUtilities= await Utilities.findOneAndDelete({ _id: utId, house: houseId  });
    return res.status(200).json({
        success: deletedUtilities ? true : false,
        deletedUtilities: deletedUtilities ? deletedUtilities : 'Cannot delete Utilities'
    });
});

const deleteUtilities = asyncHandler(async (req, res) => {
    const {utId } = req.params;
    const deletedUtilities = await Utilities.findOneAndDelete({ _id: utId });
    return res.status(200).json({
        success: deletedUtilities ? true : false,
        deletedUtilities: deletedUtilities ? deletedUtilities : 'Cannot delete Utilities'
    });
});

module.exports = {
    createUtilities,
    getAllUtilities,
    getUtilitiesOfHouse,
    getUtilitiesOfRoom,
    // getUtilities,
    updateUtilities,
    deleteUtilities,
    deleteUtilitiesOfHouse,
    deleteUtilitiesOfRoom
};