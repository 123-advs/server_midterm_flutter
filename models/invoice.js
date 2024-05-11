const mongoose = require('mongoose'); // Erase if already required

var invoiceSchema = new mongoose.Schema({
    monthClosing: {
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
    totalAmount: {
        type: Number,
    },
    discount: {
        type: Number,
    },
    paid: {
        type: Number,
        default: 0
    },
    remaining: {
        type: Number,
    },
    afterTotalAmount: {
        type: Number,
    },
    notes: {
        type: String
    }
}, {
    timestamps: true
});

invoiceSchema.pre('save', async function (next) {
    const house = await mongoose.model('House').findById(this.house);
    if (house) {
        this.houseName = house.name;
    }
    next();
});

invoiceSchema.pre('save', async function (next) {
    const roomManagement = await mongoose.model('RoomManagement').findById(this.room);
    if (roomManagement) {
        this.roomName = roomManagement.roomName;
    }
    next();
});

invoiceSchema.pre('save', async function (next) {
    const house = await mongoose.model('House').findById(this.house);
    if (house) {
        this.houseName = house.name;
    }
    
    next();
});


invoiceSchema.pre('save', async function (next) {
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

// invoiceSchema.pre('save', async function (next) {
//     const services = await mongoose.model('ServiceManagement').find({ _id: { $in: this.service } });
//     const contracts = await mongoose.model('Contract').find({ _id: { $in: this.contract } });
//     const utilities = await mongoose.model('Utilities').find({ _id: { $in: this.contract } });

// });


invoiceSchema.pre('save', function (next) {
    if (this.discount) {
        this.afterTotalAmount = this.totalAmount - this.discount;
    } else {
        this.afterTotalAmount = this.totalAmount;
    }

    next();
});

invoiceSchema.pre('save', function (next) {
    this.remaining = this.totalAmount - this.discount - this.paid; 
    next();
});

module.exports = mongoose.model('Invoice', invoiceSchema);