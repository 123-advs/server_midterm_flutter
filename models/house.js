const mongoose = require('mongoose'); // Erase if already required
const ServiceManagement = require('../models/serviceManagement');
const RoomManagement = require('../models/roomManagement');
const Contract = require('../models/contract');

var houseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique:true,
    },
    address: {
        type: String,
        required: true,
    },
    description: {
        type: String
    },
    amenities: {
        type: Array
    },
    rules: {
        type: Array
    }
}, {
    timestamps: true
});

houseSchema.pre('remove', async function(next) {
    try {
        await RoomManagement.deleteMany({ house: this._id });
        await ServiceManagement.deleteMany({ house: this._id });
        await Contract.deleteMany({ house: this._id });

        next();
    } catch (error) {
        next(error);
    }
});

module.exports = mongoose.model('House', houseSchema);