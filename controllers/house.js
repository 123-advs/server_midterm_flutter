const { request } = require('express');
const House = require('../models/house')
const User = require('../models/user')
const RoomManagement = require('../models/roomManagement');
const ServiceManagement = require('../models/serviceManagement');
const Contract = require('../models/contract');
const asyncHandler = require('express-async-handler')
const slugify = require('slugify');


const createHouse = asyncHandler(async (req, res) => {
    if (Object.keys(req.body).length === 0) throw new Error('Missing input');

    const newHouseData = {
        ...req.body,
    };

    const newHouse = await House.create(newHouseData);

    return res.status(200).json({
        success: newHouse ? true : false,
        createdHouse: newHouse ? newHouse : 'Cannot create new House'
    });
});

const getHouse = asyncHandler(async(req, res)=>{
    const { pid } = req.params
    const house = await House.findOne({_id: pid})
    return res.status(200).json({
        success: house ? true : false,
        houseData: house ? house : 'Cannot get house'
    })
})

const getHouses = asyncHandler(async(req, res)=>{
    const houses = await House.find();
    return res.status(200).json({
        success: houses ? true : false,
        houses: houses ? houses : 'Cannot get all house'
    })
})

const updateHouse = asyncHandler(async(req, res)=>{
    const { pid} = req.params
    const updatedHouse = await House.findByIdAndUpdate(pid, req.body, {new: true})
    return res.status(200).json({
        success: updatedHouse ? true : false,
        updatedHouse: updatedHouse ? updatedHouse : 'Cannot update House'
    })
})

const deleteHouse = asyncHandler(async (req, res) => {
    const { pid } = req.params;
    try {
        await RoomManagement.deleteMany({ house: pid });
        await ServiceManagement.deleteMany({ house: pid });
        await Contract.deleteMany({ house: pid });

        const deletedHouse = await House.deleteOne({ _id: pid });

        return res.status(200).json({
            success: deletedHouse ? true : false,
            deletedHouse: deletedHouse ? deletedHouse : 'Cannot delete House'
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

module.exports = {
    createHouse,
    getHouse,
    getHouses,
    updateHouse,
    deleteHouse,
}