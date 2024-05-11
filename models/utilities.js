const mongoose = require('mongoose'); // Erase if already required

var utilitiesSchema = new mongoose.Schema({
    dateClosing: {
        type: Date,
        required: true
    },
    house: {
        type: mongoose.Types.ObjectId,
        ref: 'House',
        required: true
    },
    houseName: String,
    room: {
        type: mongoose.Types.ObjectId,
        ref: 'RoomManagement',
        required: true
    },
    roomName: String,
    contract: {
        type: mongoose.Types.ObjectId,
        ref: 'Contract',
        required: true
    },
    contractName: String,
    electricityPrevious: {
        type: Number,
        required: true
    },
    electricityCurrent: {
        type: Number,
        required: true
    },
    waterPrevious: {
        type: Number,
        required: true
    },
    waterCurrent: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

utilitiesSchema.pre('save', async function (next) {
    const house = await mongoose.model('House').findById(this.house);
    if (house) {
        this.houseName = house.name;
    }
    next();
});

utilitiesSchema.pre('save', async function (next) {
    const roomManagement = await mongoose.model('RoomManagement').findById(this.room);
    if (roomManagement) {
        this.roomName = roomManagement.roomName;
    }
    next();
});

utilitiesSchema.pre('save', async function (next) {
    const house = await mongoose.model('House').findById(this.house);
    if (house) {
        this.houseName = house.name;
    }

    // Xử lý contractName
    const contract = await mongoose.model('Contract').findById(this.contract);
    if (contract) {
        this.contractName = contract.tenantFullName;
    }

    next();
});

module.exports = mongoose.model('Utilities', utilitiesSchema);