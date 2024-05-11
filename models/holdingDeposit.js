const mongoose = require('mongoose'); // Erase if already required

var holdingDepositSchema = new mongoose.Schema({
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
    tenantPhone: {
        type: String,
        required: true
    },
    tenant: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
    },
    tenantFullName: {
        type: String,
        required: true
    },
    idCard: {
        type: String
    },
    email: {
        type: String
    },
    depositAmount: {
        type: Number,
        required: true
    },
    expectedEntryDate: {
        type: Date,
        required: true
    },
    notes: {
        type: String
    }
}, {
    timestamps: true
});

holdingDepositSchema.pre('save', async function (next) {
    const house = await mongoose.model('House').findById(this.house);
    if (house) {
        this.houseName = house.name;
    }
    next();
});

holdingDepositSchema.pre('save', async function (next) {
    const roomManagement = await mongoose.model('RoomManagement').findById(this.room);
    if (roomManagement) {
        this.roomName = roomManagement.roomName;
    }
    next();
});

holdingDepositSchema.pre('save', async function (next) {
    const user = await mongoose.model('User').findById(this.tenant);
    if (user) {
        this.tenantFullName = user.firstname;
    }
    next();
});

module.exports = mongoose.model('HoldingDeposit', holdingDepositSchema);