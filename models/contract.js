const mongoose = require('mongoose'); // Erase if already required

var contractSchema = new mongoose.Schema({
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
    startDate: {
        type: Date,
        required: true
    },
    contractDuration: {
        type: Date,
        required: true
    },
    rentPrice: {
        type: Number,
        required: true
    },
    deposit: {
        type: Number,
        required: true
    },
    paymentCycle: {
        type: String,
        required: true
    },
    closingDate: {
        type: String,
        required: true
    },
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
    email: {
        type: String
    },
    dateOfBirth: {
        type: Date
    },
    idCard: {
        type: String
    },
    address: {
        type: String
    },
    notes: {
        type: String
    },
    service: [{
        type: mongoose.Types.ObjectId,
        ref: 'ServiceManagement',
    }],
    serviceName: [String],
}, {
    timestamps: true
});

contractSchema.pre('save', async function (next) {
    const house = await mongoose.model('House').findById(this.house);
    if (house) {
        this.houseName = house.name;
    }
    next();
});

contractSchema.pre('save', async function (next) {
    const roomManagement = await mongoose.model('RoomManagement').findById(this.room);
    if (roomManagement) {
        this.roomName = roomManagement.roomName;
    }
    next();
});

contractSchema.pre('save', async function (next) {
    const house = await mongoose.model('House').findById(this.house);
    if (house) {
        this.houseName = house.name;
    }

    const services = await mongoose.model('ServiceManagement').find({ _id: { $in: this.service } });
    if (services.length > 0) {
        this.serviceName = services.map(service => service.serviceName);
    }
    
    next();
});

contractSchema.pre('save', async function (next) {
    const user = await mongoose.model('User').findById(this.tenant);
    if (user) {
        this.tenantFullName = `${user.lastname} ${user.firstname}`;
    }
    next();
});

module.exports = mongoose.model('Contract', contractSchema);