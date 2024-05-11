const mongoose = require('mongoose');
const Contract = require('../models/contract');

const serviceManagementSchema = new mongoose.Schema({
    serviceName: {
        type: String,
        required: true
    },
    serviceType: {
        type: String,
        enum: [
            'Điện cố định theo đồng hồ',
            'Điện cố định theo người',
            'Nước cố định theo đồng hồ',
            'Nước cố định theo người',
            'Gửi xe',
            'Vệ sinh',
            'Internet',
            'Phí quản lý',
            'Biến động khác',
            'Phí khác'
        ],
        required: true
    },
    price: {
        type: Number,
    },
    house: {
        type: mongoose.Types.ObjectId,
        ref: 'House',
        required: true
    },
    houseName: String
}, {
    timestamps: true
});

serviceManagementSchema.pre('save', async function (next) {
    const house = await mongoose.model('House').findById(this.house);
    if (house) {
        this.houseName = house.name;
    }
    next();
});

serviceManagementSchema.pre('remove', async function(next) {
    try {
        await Contract.deleteMany({ service: this._id });

        next();
    } catch (error) {
        next(error);
    }
});

module.exports = mongoose.model('ServiceManagement', serviceManagementSchema);