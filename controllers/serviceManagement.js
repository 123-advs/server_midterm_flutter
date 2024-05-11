const ServiceManagement = require('../models/serviceManagement');
const House = require('../models/house');
const Contract = require('../models/contract');
const User = require('../models/user')
const asyncHandler = require('express-async-handler');

const createService = asyncHandler(async (req, res) => {
    if (Object.keys(req.body).length === 0) throw new Error('Missing input');
    const { houseId } = req.params;
    const house = await House.findById(houseId);
    if (!house) throw new Error('House not found');

    const newService = await ServiceManagement.create({ ...req.body, house: houseId });
    return res.status(200).json({
        success: newService ? true : false,
        createdService: newService ? newService : 'Cannot create new Service'
    });
});

const getService = asyncHandler(async (req, res) => {
    const { houseId, pid} = req.params;
    const service = await ServiceManagement.findOne({ _id: pid, house: houseId });
    return res.status(200).json({
        success: service ? true : false,
        serviceData: service ? service : 'Cannot get service'
    });
});

const getServiceOfHouse = asyncHandler(async (req, res) => {
    const { houseId } = req.params;
    const service = await ServiceManagement.find({ house: houseId });
    return res.status(200).json({
        success: service ? true : false,
        serviceData: service ? service : 'Cannot get service of house'
    });
});

const getServices = asyncHandler(async (req, res) => {
    const services = await ServiceManagement.find();
    return res.status(200).json({
        success: services ? true : false,
        services: services ? services : 'Cannot get all services'
    });
});

const updateService = asyncHandler(async (req, res) => {
    const { pid, houseId } = req.params;
    const updatedService = await ServiceManagement.findOneAndUpdate({house: houseId, _id: pid}, req.body, { new: true });
    return res.status(200).json({
        success: updatedService ? true : false,
        updatedService: updatedService ? updatedService : 'Cannot update Service'
    });
});

const deleteServiceOfHouse = asyncHandler(async (req, res) => {
    const { houseId, pid } = req.params;

    try {
        await Contract.deleteMany({ service: pid });

        const deletedService = await ServiceManagement.findOneAndDelete({ _id: pid, house: houseId});

        return res.status(200).json({
            success: deletedService ? true : false,
            deletedService: deletedService ? deletedService : 'Cannot delete Service Of House'
        });
    } 
    catch (err) {
        return res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

const deleteService = asyncHandler(async (req, res) => {
    const { pid } = req.params;

    try {
        await Contract.deleteMany({ service: pid });

        const deletedService = await ServiceManagement.findOneAndDelete({ _id: pid});

        return res.status(200).json({
            success: deletedService ? true : false,
            deletedService: deletedService ? deletedService : 'Cannot delete Service'
        });
    } 
    catch (err) {
        return res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

module.exports = {
    createService,
    getService,
    getServiceOfHouse,
    getServices,
    updateService,
    deleteServiceOfHouse,
    deleteService
};