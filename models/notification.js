const mongoose = require('mongoose'); // Erase if already required

var notificationSchema = new mongoose.Schema({
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
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    user:[{
        type: mongoose.Types.ObjectId,
        ref: 'User',
    }],
    userName: [String],
    appointment:{
        type: mongoose.Types.ObjectId,
        ref: 'Appointment',
    },
    status: {
        type: String,
        enum: ['pending','approved', 'rejected'],
    },
}, {
    timestamps: true
});

notificationSchema.pre('save', async function (next) {
    const house = await mongoose.model('House').findById(this.house);
    if (house) {
        this.houseName = house.name;
    }

    const roomManagement = await mongoose.model('RoomManagement').findById(this.room);
    if (roomManagement) {
        this.roomName = roomManagement.roomName;
    }

    this.userName = [];
    for (const userId of this.user) {
        const user = await mongoose.model('User').findById(userId);
        if (user) {
            this.userName.push(user.firstname);
        }
    }
    next();
});


module.exports = mongoose.model('Notification', notificationSchema);