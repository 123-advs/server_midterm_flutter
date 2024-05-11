const mongoose = require('mongoose'); // Erase if already required

var issueSchema = new mongoose.Schema({
    house: {
        type: mongoose.Types.ObjectId,
        ref: 'House',
    },
    houseName: String,
    room: {
        type: mongoose.Types.ObjectId,
        ref: 'RoomManagement',
    },
    roomName: String,
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
    },
    nameIssue: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['unedited','editing', 'fixed'],
    }
}, {
    timestamps: true
});

issueSchema.pre('save', async function (next) {
    const house = await mongoose.model('House').findById(this.house);
    if (house) {
        this.houseName = house.name;
    }
    next();
});

issueSchema.pre('save', async function (next) {
    const roomManagement = await mongoose.model('RoomManagement').findById(this.room);
    if (roomManagement) {
        this.roomName = roomManagement.roomName;
    }
    next();
});

module.exports = mongoose.model('Issue', issueSchema);